const crypto = require('crypto');
const { getAdminApp, json } = require('./utils/firebase-admin');
const { getRazorpayConfig } = require('./utils/payment-config');

function verifyWebhookSignature(body, signature, webhookSecret) {
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  return expected === signature;
}

async function markPaymentSuccess(firebaseAdmin, payment, verifiedBy) {
  const orderId = payment?.order_id;
  const paymentId = payment?.id;

  if (!orderId || !paymentId) {
    throw Object.assign(new Error('Webhook payment missing order or payment id'), { statusCode: 400 });
  }

  const orderRef = firebaseAdmin.firestore().collection('paymentOrders').doc(orderId);
  const orderSnap = await orderRef.get();

  if (!orderSnap.exists) {
    throw Object.assign(new Error(`Payment order ${orderId} not found`), { statusCode: 404 });
  }

  const orderData = orderSnap.data();
  const amountMatches = Number(payment.amount) === Number(orderData.amountPaise);

  if (!amountMatches || payment.status !== 'captured') {
    throw Object.assign(new Error('Webhook payment is not a captured matching order'), { statusCode: 400 });
  }

  const verifiedAt = new Date().toISOString();
  const userRef = firebaseAdmin.firestore().collection('users').doc(orderData.userId);
  const paymentRef = firebaseAdmin.firestore().collection('payments').doc(paymentId);

  const batch = firebaseAdmin.firestore().batch();
  batch.update(userRef, {
    isPaid: true,
    hasPaid: true,
    paymentStatus: 'success',
    paymentVerifiedAt: verifiedAt,
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
  });

  batch.set(paymentRef, {
    userId: orderData.userId,
    createdByEmitraId: orderData.createdByEmitraId || null,
    createdByEmitraName: orderData.createdByEmitraName || null,
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    amount: orderData.amount,
    amountPaise: orderData.amountPaise,
    currency: orderData.currency || payment.currency || 'INR',
    status: 'success',
    verifiedBy,
    timestamp: verifiedAt,
  }, { merge: true });

  batch.update(orderRef, {
    status: 'success',
    razorpayPaymentId: paymentId,
    verifiedAt,
    verifiedBy,
  });

  await batch.commit();

  return {
    userId: orderData.userId,
    paymentId,
    orderId,
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed' });
  }

  try {
    const rawBody = event.body || '';
    const signature = event.headers['x-razorpay-signature'] || event.headers['X-Razorpay-Signature'] || '';
    const { webhookSecret } = await getRazorpayConfig();

    if (!webhookSecret) {
      return json(500, { error: 'Razorpay webhook secret is not configured' });
    }

    if (!signature || !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      return json(400, { error: 'Invalid Razorpay webhook signature' });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload?.event;

    if (eventName !== 'payment.captured') {
      return json(200, { status: 'ignored', event: eventName });
    }

    const firebaseAdmin = getAdminApp();
    const payment = payload?.payload?.payment?.entity;
    const result = await markPaymentSuccess(firebaseAdmin, payment, 'razorpay_webhook');

    return json(200, {
      status: 'success',
      ...result,
    });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return json(error?.statusCode || 500, {
      status: 'error',
      message: error?.message || 'Unable to process Razorpay webhook',
    });
  }
};
