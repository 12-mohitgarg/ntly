const { getAdminApp, json, requireAdmin } = require('./utils/firebase-admin');
const { maskKey } = require('./utils/payment-config');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, body: '' };
  }

  if (!['GET', 'PATCH', 'POST'].includes(event.httpMethod)) {
    return json(405, { error: 'Method Not Allowed' });
  }

  try {
    const authResult = await requireAdmin(event);
    if (!authResult.allowed) {
      return authResult.response;
    }

    const firebaseAdmin = getAdminApp();
    const settingsRef = firebaseAdmin.firestore().collection('privateSettings').doc('razorpay');

    if (event.httpMethod === 'GET') {
      const snap = await settingsRef.get();
      const data = snap.exists ? snap.data() : {};
      const envKeyId = process.env.RAZORPAY_KEY_ID || '';

      return json(200, {
        hasDatabaseConfig: Boolean(data?.keyId && data?.keySecret),
        keyId: data?.keyId || envKeyId || '',
        keyIdMasked: maskKey(data?.keyId || envKeyId || ''),
        source: data?.keyId ? 'database' : envKeyId ? 'environment' : 'missing',
        updatedAt: data?.updatedAt || null,
        updatedBy: data?.updatedBy || null,
      });
    }

    const { keyId, keySecret } = JSON.parse(event.body || '{}');

    if (typeof keyId !== 'string' || !keyId.startsWith('rzp_')) {
      return json(400, { error: 'Enter a valid Razorpay key id' });
    }

    if (typeof keySecret !== 'string' || keySecret.trim().length < 10) {
      return json(400, { error: 'Enter a valid Razorpay key secret' });
    }

    const payload = {
      keyId: keyId.trim(),
      keySecret: keySecret.trim(),
      updatedAt: new Date().toISOString(),
      updatedBy: authResult.decodedToken.uid,
      updatedByEmail: authResult.decodedToken.email || '',
    };

    await settingsRef.set(payload, { merge: true });

    return json(200, {
      status: 'success',
      keyIdMasked: maskKey(payload.keyId),
      updatedAt: payload.updatedAt,
      source: 'database',
    });
  } catch (error) {
    console.error('Payment settings error:', error);
    return json(500, {
      error: 'Unable to update payment settings',
      details: error?.message || 'Unknown error',
    });
  }
};
