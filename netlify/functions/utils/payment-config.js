const { getAdminApp } = require('./firebase-admin');

function maskKey(value) {
  if (!value) return '';
  if (value.length <= 8) return '••••';
  return `${value.slice(0, 8)}••••${value.slice(-4)}`;
}

async function getRazorpayConfig() {
  const firebaseAdmin = getAdminApp();
  const snap = await firebaseAdmin.firestore().collection('privateSettings').doc('razorpay').get();
  const data = snap.exists ? snap.data() : {};
  const keyId = data?.keyId || process.env.RAZORPAY_KEY_ID || '';
  const keySecret = data?.keySecret || process.env.RAZORPAY_KEY_SECRET || '';

  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys are not configured');
  }

  return { keyId, keySecret, source: data?.keyId ? 'database' : 'environment' };
}

module.exports = {
  getRazorpayConfig,
  maskKey,
};
