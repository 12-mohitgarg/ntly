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
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/5 p-10 lg:p-14 border border-slate-100 flex flex-col items-center relative overflow-hidden">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-green-600/20 relative z-10">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 uppercase italic relative z-10">Email Sent!</h2>
            <p className="text-slate-500 font-bold italic mb-10 text-sm text-center relative z-10">
              We've sent a password reset link to <span className="text-blue-600 font-black">{email}</span>. Check your inbox and follow the instructions.
            </p>
            
            <div className="w-full space-y-4 relative z-10">
              <Button 
                onClick={() => navigate('/login')}
                className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white text-lg font-black rounded-2xl shadow-xl shadow-slate-900/10 uppercase tracking-widest"
              >
                Back to Login
              </Button>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-600/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-2xl" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/5 p-10 lg:p-14 border border-slate-100 flex flex-col items-center relative overflow-hidden">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20 relative z-10">
            <Mail size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic relative z-10">Reset Password</h2>
          <p className="text-slate-500 font-bold italic mb-10 text-sm relative z-10">Enter your email to receive reset instructions</p>

          <form onSubmit={handleResetPassword} className="w-full space-y-6 relative z-10">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-tight">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Label className="uppercase tracking-[0.2em] text-[10px] font-black text-slate-400 px-1">Email Address</Label>
              <div className="relative">
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 pl-12 transition-all font-bold"
                  placeholder="e.g. abhishek@gmail.com"
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white text-lg font-black rounded-2xl shadow-xl shadow-blue-600/20 uppercase tracking-widest">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="mt-8 w-full text-center relative z-10">
            <Link to="/login" className="text-slate-500 text-xs font-black uppercase tracking-widest hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-2xl" />
        </div>
      </motion.div>
    </div>
  );
}
