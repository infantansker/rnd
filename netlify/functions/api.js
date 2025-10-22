
// netlify/functions/api.js
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const path = require('path');

// Load environment variables from the root .env file
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const app = express();

// Add logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// Middleware with CORS configuration for development and production
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5001', process.env.URL, process.env.DEPLOY_PRIME_URL],
  credentials: true
}));
app.use(express.json());

// Determine mode (test or live)
const razorpayMode = process.env.RAZORPAY_MODE || 'test';

// Set keys based on mode
const razorpayKeyId = razorpayMode === 'live' 
  ? process.env.RAZORPAY_KEY_ID_LIVE 
  : process.env.RAZORPAY_KEY_ID_TEST;

const razorpayKeySecret = razorpayMode === 'live' 
  ? process.env.RAZORPAY_KEY_SECRET_LIVE 
  : process.env.RAZORPAY_KEY_SECRET_TEST;

// Get webhook secret
const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

// Initialize Razorpay instance
let razorpay;
try {
  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error('Razorpay keys are not configured');
  }
  
  razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
  console.log('✅ Razorpay instance initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Razorpay instance:', error.message);
  razorpay = null;
}

// Route to create Razorpay order
app.post('/api/create-order', async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({
        error: 'Payment service not available',
        message: 'Razorpay service is not properly configured. Please contact the administrator.'
      });
    }

    const { amount, currency, eventId, userId, eventName } = req.body;
    if (!amount || !currency || !eventId || !userId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Missing required fields: amount, currency, eventId, userId',
      });
    }

    const options = {
      amount: amount,
      currency: currency,
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        eventId: eventId,
        userId: userId,
        eventName: eventName || 'Event',
        mode: razorpayMode,
      },
    };

    const order = await razorpay.orders.create(options);
    res.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(error.statusCode || 500).json({
      error: 'Failed to create order',
      message: (error.error && error.error.description) || error.message,
    });
  }
});

// Route to create QR code payment order
app.post('/api/create-qr-order', async (req, res) => {
    try {
        if (!razorpay) {
            return res.status(500).json({ error: 'Payment service not available' });
        }
        const { amount, currency, eventId, userId, eventName, customerName, customerEmail, customerPhone } = req.body;
        if (!amount || !currency || !eventId || !userId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const options = {
            type: 'upi_qr',
            name: 'R&D Run and Develop',
            description: `Payment for ${eventName || 'Event'}`,
            fixed_amount: true,
            payment_amount: amount,
            customer_name: customerName || 'Customer',
            customer_email: customerEmail || '',
            customer_contact: customerPhone || '',
            notes: { eventId, userId, eventName, mode: razorpayMode },
        };
        const qrCode = await razorpay.qrCode.create(options);
        res.json({
            id: qrCode.id,
            qrCode: qrCode.qr_code,
            shortUrl: qrCode.short_url,
            amount: qrCode.amount,
            currency: qrCode.currency,
            status: qrCode.status
        });
    } catch (error) {
        console.error('Error creating Razorpay QR code:', error);
        res.status(error.statusCode || 500).json({
            error: 'Failed to create QR code',
            message: (error.error && error.error.description) || error.message,
        });
    }
});

// Route to check payment status for a QR code order
app.get('/api/check-payment-status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        if (!razorpay) {
            return res.status(500).json({ error: 'Payment service not available' });
        }
        const qrCode = await razorpay.qrCode.fetch(orderId);
        if (qrCode && qrCode.payments && qrCode.payments.count > 0) {
            const payments = await razorpay.qrCode.fetchAllPayments(orderId);
            if (payments && payments.items && payments.items.length > 0) {
                const latestPayment = payments.items[0];
                return res.json({
                    status: latestPayment.status,
                    paymentId: latestPayment.id,
                    orderId: latestPayment.order_id
                });
            }
        }
        res.json({ status: 'pending' });
    } catch (error) {
        console.error('Error checking payment status:', error);
        res.status(error.statusCode || 500).json({
            error: 'Failed to check payment status',
            message: (error.error && error.error.description) || error.message,
        });
    }
});

// Route to verify payment
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    const isVerified = expectedSignature === razorpay_signature;
    if (isVerified) {
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      error: 'Failed to verify payment',
      message: error.message,
    });
  }
});

// Webhook endpoint for real-time payment updates
app.post('/api/webhook', express.raw({type: 'application/json'}), (req, res) => {
  try {
    if (razorpayWebhookSecret) {
      const signature = req.headers['x-razorpay-signature'];
      const hmac = crypto.createHmac('sha256', razorpayWebhookSecret);
      hmac.update(req.body);
      const expectedSignature = hmac.digest('hex');
      if (expectedSignature !== signature) {
        return res.status(400).send('Webhook signature verification failed');
      }
    }
    const event = JSON.parse(req.body);
    console.log('Webhook event received:', event.event);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mode: razorpayMode,
    keyIdSet: !!razorpayKeyId,
    razorpayInitialized: !!razorpay
  });
});

// Catch-all for any other routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.path} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred',
  });
});

// Export the handler for Netlify
module.exports.handler = serverless(app);
