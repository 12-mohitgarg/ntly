const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: "rzp_live_SoVxB05ogtK0Fl",
  key_secret: '23a2eaU3UwRf4LnZaBWVvpvr',
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { amount, currency = 'INR' } = JSON.parse(event.body || '{}');

    if (!amount) {
      return { statusCode: 400, body: 'Amount is required' };
    }

    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    const order = await razorpay.orders.create(options);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    };
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Error creating Razorpay order', details: error.description || error.message || 'Unknown error' }),
    };
  }
};
