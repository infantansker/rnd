// Netlify function for creating Razorpay orders
const Razorpay = require('razorpay');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.handler = async (event, context) => {
  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({
          error: 'Method not allowed',
          message: 'Only POST requests are allowed',
        }),
      };
    }

    // Parse the request body
    const { amount, currency, eventId, userId, eventName } = JSON.parse(event.body);

    // Validate request
    if (!amount || !currency || !eventId || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields',
          message: 'Missing required fields: amount, currency, eventId, userId',
        }),
      };
    }

    // Validate amount
    if (amount <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid amount',
          message: 'Amount must be greater than zero',
        }),
      };
    }

    // Create order options
    const options = {
      amount: amount, // Amount in paise
      currency: currency,
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        eventId: eventId,
        userId: userId,
        eventName: eventName || 'Event',
        mode: process.env.RAZORPAY_MODE || 'test',
      },
    };

    // Create order using Razorpay API
    const order = await razorpay.orders.create(options);

    // Return order details to frontend
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: order.id,
        currency: order.currency,
        amount: order.amount,
      }),
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    
    // Handle different types of errors
    if (error.statusCode === 401) {
      // Authentication error - usually means invalid keys
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Authentication failed',
          message: 'Invalid Razorpay credentials. Please check the API keys.',
        }),
      };
    } else if (error.statusCode) {
      // Other Razorpay API errors
      return {
        statusCode: error.statusCode,
        body: JSON.stringify({
          error: 'Razorpay API error',
          message: error.error.description || error.error.reason || error.error,
        }),
      };
    } else {
      // Unexpected errors
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Failed to create order',
          message: error.message || 'An unexpected error occurred while creating the payment order',
        }),
      };
    }
  }
};