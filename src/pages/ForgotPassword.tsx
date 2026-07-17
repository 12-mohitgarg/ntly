import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent successfully');
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err.code, err.message);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError(`Failed to send reset email: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-blue-50/40 via-white to-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full animate-fade-in"
        >
          <div className="bg-white rounded-[2.25rem] shadow-soft p-10 sm:p-12 border border-slate-150/60 flex flex-col items-center relative overflow-hidden">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-green-100/50">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4 uppercase text-center">Email Sent!</h2>
            <p className="text-slate-400 font-semibold mb-8 text-xs text-center leading-relaxed">
              We've sent a password reset link to <span className="text-blue-600 font-extrabold">{email}</span>. Check your inbox and follow the instructions.
            </p>
            
            <div className="w-full relative z-10">
              <Button 
                onClick={() => navigate('/login')}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-sm uppercase tracking-widest cursor-pointer transition"
              >
                Back to Login
              </Button>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-blue-50/40 via-white to-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-[2.25rem] shadow-soft hover:shadow-elegant transition-all duration-300 p-10 sm:p-12 border border-slate-150/60 flex flex-col items-center relative overflow-hidden">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 border border-blue-100/50 rounded-2xl flex items-center justify-center mb-6 shadow-sm hover:rotate-6 transition-transform">
            <Mail size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1 uppercase text-center">Reset Password</h2>
          <p className="text-slate-400 font-semibold mb-8 text-xs text-center">Enter your email to receive reset instructions</p>

          <form onSubmit={handleResetPassword} className="w-full space-y-5 relative z-10">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-tight">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="uppercase tracking-[0.2em] text-[9px] font-black text-slate-400 px-1">Email Address</Label>
              <div className="relative">
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 pl-11 transition-all font-semibold text-sm text-slate-850 shadow-inner"
                  placeholder="e.g. name@domain.com"
                  required
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 bg-blue-600 hover:bg-blue-500 hover:scale-[1.01] text-white text-xs font-black rounded-xl shadow-md shadow-blue-500/10 uppercase tracking-widest transition-all duration-300 cursor-pointer">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="mt-6 w-full text-center relative z-10 border-t border-slate-100 pt-5">
            <Link to="/login" className="text-slate-400 text-xs font-extrabold uppercase tracking-wider hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
              <ArrowLeft size={14} />
              Back to Login
            </Link>
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />
        </div>
      </motion.div>
    </div>
  );
}
