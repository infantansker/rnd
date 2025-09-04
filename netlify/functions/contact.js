const emailjs = require('@emailjs/nodejs');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse the request body
    const { name, email, message } = JSON.parse(event.body);

    // Validate required fields
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // EmailJS configuration (these would be set in Netlify environment variables)
    const serviceID = process.env.EMAILJS_SERVICE_ID;
    const templateID = process.env.EMAILJS_TEMPLATE_ID;
    const userID = process.env.EMAILJS_USER_ID;

    // Check if EmailJS credentials are configured
    if (!serviceID || !templateID || !userID) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Email service not properly configured' })
      };
    }

    // Prepare email template parameters
    const templateParams = {
      from_name: name,
      from_email: email,
      message: message,
      to_name: 'Run Development Team'
    };

    // Send email using EmailJS
    await emailjs.send(serviceID, templateID, templateParams, {
      publicKey: userID,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Message sent successfully!',
        success: true 
      })
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send message',
        details: error.message 
      })
    };
  }
};