// Netlify function for verifying Razorpay payments
const crypto = require('crypto');

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = JSON.parse(event.body);

    // Get the key secret from environment variables
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Create expected signature
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    // Verify signature
    const isVerified = expectedSignature === razorpay_signature;

    if (isVerified) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          success: true, 
          message: 'Payment verified successfully' 
        }),
      };
    } else {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          success: false, 
          message: 'Invalid signature' 
        }),
      };
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Failed to verify payment',
        message: error.message,
      }),
    };
  }
};