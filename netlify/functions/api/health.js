// Netlify function for health check
exports.handler = async (event, context) => {
  try {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        body: JSON.stringify({
          error: 'Method not allowed',
          message: 'Only GET requests are allowed',
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        mode: process.env.RAZORPAY_MODE || 'test',
        keyIdSet: !!process.env.RAZORPAY_KEY_ID,
      }),
    };
  } catch (error) {
    console.error('Error in health check:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};