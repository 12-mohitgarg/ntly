import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { motion } from 'motion/react';
import { GraduationCap, ArrowRight, Lock, Mail, AlertCircle, Handshake } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/5 p-10 lg:p-14 border border-slate-100 flex flex-col items-center relative overflow-hidden">
          <div className="w-20 h-20 bg-[#1e40af] text-white rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20 relative z-10">
             <Handshake size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic relative z-10">Welcome Back.</h2>
          <p className="text-slate-500 font-bold italic mb-10 text-sm relative z-10">Continue your 120-hour industry program</p>

          <form onSubmit={handleLogin} className="w-full space-y-6 relative z-10">
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
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="uppercase tracking-[0.2em] text-[10px] font-black text-slate-400 px-1">Password</Label>
              <div className="relative">
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 pl-12 transition-all font-bold"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white text-lg font-black rounded-2xl shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 uppercase tracking-widest">
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={20} />
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 w-full text-center relative z-10">
             <p className="text-slate-500 text-sm font-bold italic">
               Don't have an account? <Link to="/register" className="text-blue-600 font-black hover:underline underline-offset-4 decoration-2">Join now</Link>
             </p>
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-2xl" />
        </div>
      </motion.div>
    </div>

  );
}
