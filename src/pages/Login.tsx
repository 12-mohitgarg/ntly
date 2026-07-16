import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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
      // Firebase Auth login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user exists in users collection
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        // Regular user - navigate to dashboard
        navigate('/dashboard');
      } else {
        // Not in users collection - admin or teacher
        if (user.email === 'admin@internmitra.com') {
          navigate('/admin-dashboard');
          return;
        }

        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        const adminData = adminDoc.exists() ? adminDoc.data() : null;

        navigate(adminData?.role === 'teacher' ? '/admin/daily-videos' : '/admin-dashboard');
      }
    } catch (err: any) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#fafbfc] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-[2.5rem] shadow-md p-10 lg:p-14 border border-slate-100 flex flex-col items-center relative overflow-hidden">
          <div className="w-18 h-18 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-600/20 relative z-10 hover:rotate-6 transition-transform">
             <Handshake size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 uppercase relative z-10">Welcome Back</h2>
          <p className="text-slate-400 font-semibold mb-8 text-xs relative z-10">Continue your 120-hour industry program</p>

          <form onSubmit={handleLogin} className="w-full space-y-5 relative z-10">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-tight">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label className="uppercase tracking-[0.2em] text-[10px] font-black text-slate-500 px-1">Email Address</Label>
              <div className="relative">
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 pl-12 transition-all font-semibold"
                  placeholder="e.g. abhishek@gmail.com"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="uppercase tracking-[0.2em] text-[10px] font-black text-slate-500 px-1">Password</Label>
              <div className="relative">
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 pl-12 transition-all font-semibold"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 bg-indigo-600 hover:bg-slate-900 text-white text-xs font-black rounded-2xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 uppercase tracking-widest hover:scale-[1.01] transition-transform duration-300">
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
            </Button>
          </form>

          <div className="mt-5 w-full text-center relative z-10">
             <Link to="/forgot-password" className="text-slate-400 text-xs font-extrabold uppercase tracking-wider hover:text-indigo-600 transition-colors">
                Forgot Password?
             </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 w-full text-center relative z-10">
             <p className="text-slate-400 text-sm font-semibold">
               Don't have an account? <Link to="/register" className="text-indigo-600 font-extrabold hover:underline underline-offset-4 decoration-2">Join now</Link>
             </p>
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />
        </div>
      </motion.div>
    </div>
  );
}
