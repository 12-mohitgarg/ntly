import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { motion } from 'motion/react';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeValid, setCodeValid] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const actionCode = searchParams.get('oobCode');
    if (!actionCode) {
      setError('Invalid reset link. Please request a new password reset.');
      setVerifying(false);
      return;
    }

    verifyPasswordResetCode(auth, actionCode)
      .then(() => {
        setCodeValid(true);
        setVerifying(false);
      })
      .catch((err) => {
        setError('Invalid or expired reset link. Please request a new password reset.');
        setVerifying(false);
      });
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const actionCode = searchParams.get('oobCode');
      await confirmPasswordReset(auth, actionCode!, password);
      setSuccess(true);
    } catch (err: any) {
      setError('Failed to reset password. The link may have expired. Please request a new reset.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#fafbfc] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-[2.5rem] shadow-md p-10 lg:p-14 border border-slate-100 flex flex-col items-center relative overflow-hidden">
            <div className="w-18 h-18 bg-slate-50 border border-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mb-8 shadow-sm relative z-10 animate-pulse">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase relative z-10">Verifying Link</h2>
            <p className="text-slate-400 font-semibold text-xs text-center relative z-10">
              Please wait while we verify your password reset link.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error && !codeValid) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#fafbfc] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-[2.5rem] shadow-md p-10 lg:p-14 border border-slate-100 flex flex-col items-center relative overflow-hidden">
            <div className="w-18 h-18 bg-red-50 text-red-600 border border-red-100 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-red-600/10 relative z-10">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4 uppercase relative z-10">Invalid Link</h2>
            <p className="text-slate-400 font-semibold mb-8 text-xs text-center relative z-10 leading-relaxed">
              {error}
            </p>
            
            <div className="w-full space-y-4 relative z-10">
              <Button 
                onClick={() => navigate('/forgot-password')}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-indigo-600/10 uppercase tracking-widest"
              >
                Request New Link
              </Button>
              <Button 
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full h-14 border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-black rounded-2xl uppercase tracking-widest"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#fafbfc] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-[2.5rem] shadow-md p-10 lg:p-14 border border-slate-100 flex flex-col items-center relative overflow-hidden">
            <div className="w-18 h-18 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-green-600/10 relative z-10">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4 uppercase relative z-10">Password Updated!</h2>
            <p className="text-slate-400 font-semibold mb-8 text-xs text-center relative z-10 leading-relaxed">
              Your password has been successfully reset. You can now login with your new credentials.
            </p>
            
            <div className="w-full relative z-10">
              <Button 
                onClick={() => navigate('/login')}
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-2xl shadow-md uppercase tracking-widest"
              >
                Go to Login
              </Button>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#fafbfc] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-[2.5rem] shadow-md p-10 lg:p-14 border border-slate-100 flex flex-col items-center relative overflow-hidden">
          <div className="w-18 h-18 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-sm relative z-10 hover:rotate-6 transition-transform">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase relative z-10">New Password</h2>
          <p className="text-slate-400 font-semibold mb-8 text-xs relative z-10 text-center">Enter your new password below</p>

          <form onSubmit={handleResetPassword} className="w-full space-y-5 relative z-10">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-tight">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label className="uppercase tracking-[0.2em] text-[10px] font-black text-slate-500 px-1">New Password</Label>
              <div className="relative">
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 pl-12 transition-all font-semibold"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="uppercase tracking-[0.2em] text-[10px] font-black text-slate-500 px-1">Confirm Password</Label>
              <div className="relative">
                <Input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 pl-12 transition-all font-semibold"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 bg-indigo-600 hover:bg-slate-900 text-white text-xs font-black rounded-2xl shadow-lg shadow-indigo-600/10 uppercase tracking-widest">
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>

          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />
        </div>
      </motion.div>
    </div>
  );
}
