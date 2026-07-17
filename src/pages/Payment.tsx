import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, updateDoc, setDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { motion } from 'motion/react';
import { CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface College {
  id: string;
  name: string;
  districtId: string;
  price: number;
}

export default function Payment() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);
  const [amount, setAmount] = useState(1000);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const collegesRef = collection(db, 'colleges');
      const collegesSnapshot = await getDocs(collegesRef);
      const collegesData = collegesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as College));
      setColleges(collegesData);

      if (profile?.college) {
        const userCollege = collegesData.find(c => c.name === profile.college);
        setAmount(userCollege?.price || 1000);
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  useEffect(() => {
    if (profile?.college && colleges.length > 0) {
      const userCollege = colleges.find(c => c.name === profile.college);
      setAmount(userCollege?.price || 1000);
    }
  }, [profile, colleges]);

  const handlePayment = async () => {
    if (!user) return;

    if (typeof window.Razorpay === 'undefined') {
      console.error('Razorpay SDK not loaded');
      alert('Payment gateway is still initializing. Please wait a moment and try again.');
      return;
    }

    setLoading(true);

    try {
      const options = {
        key: "rzp_live_SoVxB05ogtK0Fl",
        amount: amount * 100,
        currency: 'INR',
        name: 'INTERNMITRA',
        description: 'Internship Registration Fee',
        handler: async function (response: any) {
          console.log('Payment received:', response.razorpay_payment_id);
          try {
             if (!response.razorpay_payment_id) {
              throw new Error('Missing Razorpay payment/order id');
            }
            await updateDoc(doc(db, 'users', user.uid), {
              isPaid: true
            });
            await setDoc(doc(db, 'payments', response.razorpay_payment_id), {
              userId: user.uid,
              razorpayOrderId: response.razorpay_order_id || '',
              razorpayPaymentId: response.razorpay_payment_id,
              amount: amount,
              status: 'success',
              timestamp: new Date().toISOString()
            });
            setSuccess(true);
          } catch (err) {
            console.error('Firestore update error:', err);
            alert('Payment received but verification request could not be saved. Please contact support with payment ID: ' + response.razorpay_payment_id);
          }
        },
        prefill: {
          name: profile?.fullName,
          email: profile?.email,
          contact: profile?.contactNumber
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: function () {
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
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-[#f8fafc] p-6">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-[#0c1329] p-10 sm:p-12 rounded-[2.25rem] shadow-2xl text-center relative overflow-hidden group border border-slate-800"
        >
          <div className="relative z-10 space-y-6">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto border-4 border-slate-800 shadow-xl shadow-blue-500/10 transition-transform group-hover:rotate-6">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">Payment Complete</h2>
            <p className="text-slate-400 leading-relaxed text-xs">Registration credentials synchronized. Your industry training program begins now.</p>
            <Button onClick={() => navigate('/dashboard')} className="w-full h-12 bg-white hover:bg-blue-600 hover:text-white text-slate-900 text-xs uppercase tracking-widest font-black rounded-xl shadow-md cursor-pointer transition-all duration-300">
              Enter Operations Dashboard
            </Button>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50 p-6">
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full bg-white p-8 sm:p-12 rounded-[2.25rem] shadow-soft border border-slate-150/60 relative overflow-hidden"
      >
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-sm">
              <CreditCard size={24} />
            </div>
            <div>
              <span className="text-[9px] text-blue-600 font-black uppercase tracking-[0.25em] block leading-none">Step 04</span>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight uppercase leading-none mt-1">Enrollment Payment</h2>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">Reference</span>
              <span className="text-slate-850 font-black tracking-tight">IM-2026-ACTIVE</span>
            </div>
            <div className="flex justify-between items-center text-slate-900 font-extrabold">
              <span className="text-slate-800 font-black text-sm uppercase">Commitment Fee</span>
              <span className="text-lg text-slate-900 font-black">₹{amount}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-blue-50 text-blue-600 rounded-full p-1 border border-blue-100"><ShieldCheck size={14} /></div>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Secure transaction via <span className="text-slate-700 font-extrabold uppercase tracking-tight">Razorpay</span> encrypted tunnel.
              </p>
            </div>
            <Button onClick={handlePayment} disabled={loading} className="w-full h-12 bg-blue-600 hover:bg-slate-900 hover:scale-[1.01] text-white text-xs uppercase tracking-widest font-black rounded-xl shadow-md shadow-blue-500/10 cursor-pointer transition-all duration-300">
              {loading ? 'Initializing Tunnel...' : `Pay Registration Fee (₹${amount})`}
            </Button>
            <div className="text-center text-[9px] text-slate-400 font-black uppercase tracking-widest">All-inclusive. Zero Shadow Costs.</div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 blur-xl pointer-events-none" />
      </motion.div>
    </div>
  );
}
