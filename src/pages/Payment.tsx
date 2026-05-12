import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { motion } from 'motion/react';
import { CreditCard, ShieldCheck, CheckCircle2, IndianRupee } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Payment() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = async () => {
    if (!user) return;
    
    if (typeof window.Razorpay === 'undefined') {
      console.error('Razorpay SDK not loaded');
      alert('Payment gateway is still initializing. Please wait a moment and try again.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on server
      const response = await fetch('/api/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 500 })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Order creation failed: ${errorText}`);
      }

      const order = await response.json();
      console.log('Order created successfully:', order.id);

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SnzhdLV74kWqEv',
        amount: order.amount,
        currency: order.currency,
        name: 'INTERNMITRA',
        description: 'Internship Registration Fee',
        order_id: order.id,
        handler: async function (response: any) {
          console.log('Payment received:', response.razorpay_payment_id);
          try {
            // 3. Verify payment on server
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response)
            });

            if (!verifyRes.ok) {
              throw new Error('Payment verification failed');
            }

            const verifyData = await verifyRes.json();

            if (verifyData.status === 'success') {
              // 4. Update Firestore
              await updateDoc(doc(db, 'users', user.uid), {
                isPaid: true
              });
              await setDoc(doc(db, 'payments', response.razorpay_payment_id), {
                userId: user.uid,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                amount: 500,
                status: 'success',
                timestamp: new Date().toISOString()
              });
              setSuccess(true);
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (verifyError) {
            console.error('Verification Error:', verifyError);
            alert('Error verifying payment. Please do not close this page and contact support with your payment ID.');
          }
        },
        prefill: {
          name: profile?.fullName,
          email: profile?.email,
          contact: profile?.contactNumber
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment Failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (error) {
      console.error('Payment Error:', error);
      alert('Could not initialize payment. Please check your internet connection and try again.');
    } finally {
      // Note: loading state is also handled in rzp callbacks
    }
  };

  if (success) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50 p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-slate-900 p-12 lg:p-16 rounded-[4rem] shadow-2xl text-center relative overflow-hidden group"
        >
          <div className="relative z-10">
            <div className="w-28 h-28 bg-blue-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border-8 border-slate-800 shadow-2xl shadow-blue-600/30 transition-transform group-hover:rotate-12">
              <CheckCircle2 size={56} />
            </div>
            <h2 className="text-4xl font-black text-white mb-6 tracking-tighter uppercase italic">Authorization Complete</h2>
            <p className="text-slate-400 mb-12 leading-relaxed text-lg italic font-bold">Registration protocols synchronized. Your industrial journey begins now.</p>
            <Button onClick={() => navigate('/dashboard')} className="w-full h-20 bg-white hover:bg-blue-600 hover:text-white text-slate-900 text-xs uppercase tracking-[0.2em] font-black rounded-2xl shadow-xl transition-all duration-500">
              Enter Operations Center
            </Button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-slate-100 p-6">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full bg-white p-12 lg:p-16 rounded-[4rem] shadow-2xl border border-slate-100 relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-12">
            <div className="p-5 bg-blue-50 text-blue-600 rounded-[1.5rem] border border-blue-100 shadow-xl shadow-blue-600/5">
              <CreditCard size={36} />
            </div>
            <div>
              <h3 className="text-[10px] text-blue-600 font-black uppercase tracking-[0.4em] mb-1 italic">Protocol 04</h3>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Financial Guard.</h2>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-[2.5rem] mb-12 border border-slate-100 shadow-inner">
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-400 font-black uppercase tracking-widest text-[10px] italic">Registry Point</span>
              <span className="text-slate-900 font-black italic tracking-tighter">IM-2026-ACTIVE</span>
            </div>
            <div className="flex justify-between items-center text-3xl font-black text-slate-900 italic">
              <span className="tracking-tighter">COMMIT FEE</span>
              <span className="flex items-center text-blue-600">₹500.00</span>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex-shrink-0 bg-blue-50 text-blue-600 rounded-full p-1.5 shadow-sm border border-blue-100"><ShieldCheck size={18} /></div>
              <p className="text-xs text-slate-400 font-bold italic leading-relaxed">Secure transaction via <span className="text-slate-900 font-black uppercase tracking-tighter">Razorpay</span> encrypted tunnel. High-integrity processing.</p>
            </div>
            <Button onClick={handlePayment} disabled={loading} className="w-full h-20 bg-blue-600 hover:bg-slate-900 text-white text-xs uppercase tracking-[0.2em] font-black rounded-2xl shadow-2xl shadow-blue-600/20 transition-all duration-500 hover:scale-[1.02]">
              {loading ? 'Initializing Tunnel...' : 'Finalize Commit (₹500)'}
            </Button>
            <div className="text-center text-[10px] text-slate-300 font-black uppercase tracking-widest italic">All-inclusive. Zero Shadow Costs.</div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full translate-x-12 -translate-y-12 -z-0" />
      </motion.div>
    </div>

  );
}
