const { reconcilePayments } = require('./utils/payment-reconcile-core');

exports.handler = async () => {
  try {
    const result = await reconcilePayments({
      limit: 100,
      verifiedBy: 'scheduled_reconcile',
    });

    console.log('Scheduled Razorpay reconcile complete:', result);

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'success', ...result }),
    };
  } catch (error) {
    console.error('Scheduled Razorpay reconcile failed:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'error',
        message: error?.message || 'Scheduled reconcile failed',
      }),
    };
  }
};
