import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Lock, Mail, AlertCircle, Handshake, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNotice, setShowNotice] = useState(true); // EzyIntern style important notice modal
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        navigate('/dashboard');
      } else {
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
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-blue-50/40 via-white to-slate-50/50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Notice Modal (EzyIntern style) */}
      <AnimatePresence>
        {showNotice && (
          <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 relative overflow-hidden"
            >
              <div className="flex items-center gap-3 text-amber-600">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-800">Important Notice</h3>
              </div>

              <div className="space-y-3.5 text-slate-600 font-semibold text-xs sm:text-sm leading-relaxed">
                <p className="font-extrabold text-slate-800 border-b border-slate-100 pb-2">पासवर्ड रीसेट करने के लिए निर्देश:</p>
                <p>1. यदि आप अपना पासवर्ड भूल गए हैं, तो नीचे दिए गए <strong>"Forgot Password"</strong> लिंक पर क्लिक करें।</p>
                <p>2. अपना पंजीकृत ईमेल दर्ज करें और रीसेट ईमेल प्राप्त करें।</p>
                <p>3. किसी भी सहायता के लिए हमारे आधिकारिक व्हाट्सऐप चैनल से जुड़ें।</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setShowNotice(false)}
                  className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-widest transition cursor-pointer"
                >
                  Understood
                </button>
                <a
                  href="https://wa.me/919693921517"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-12 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 transition text-center shadow-md shadow-green-500/10"
                >
                  Support Channel
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white rounded-[2.25rem] shadow-soft hover:shadow-elegant transition-all duration-300 p-8 sm:p-12 border border-slate-150/60 flex flex-col items-center relative overflow-hidden">
          
          {/* Logo Brand container */}
          <div className="w-16 h-16 bg-blue-50 text-blue-600 border border-blue-100/50 rounded-2xl flex items-center justify-center mb-6 shadow-sm hover:rotate-6 transition-transform">
             <Handshake size={28} />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1 uppercase">Welcome Back</h2>
          <p className="text-slate-400 font-semibold mb-8 text-xs">Continue your 120-hour industry program</p>

          <form onSubmit={handleLogin} className="w-full space-y-5">
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
                  required
                  onChange={(e) => setEmail(e.target.value)} 
                  className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 pl-11 transition-all font-semibold text-sm text-slate-800 shadow-inner"
                  placeholder="e.g. name@domain.com"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <Label className="uppercase tracking-[0.2em] text-[9px] font-black text-slate-400">Password</Label>
                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 text-[9px] font-black uppercase tracking-wider">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  required
                  onChange={(e) => setPassword(e.target.value)} 
                  className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 pl-11 pr-11 transition-all font-semibold text-sm text-slate-800 shadow-inner"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Custom EI Shield Security Segment */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
              <span>Secure Authentication</span>
              <span className="text-emerald-600 font-black flex items-center gap-1">🛡 Verified</span>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 bg-blue-600 hover:bg-blue-500 hover:scale-[1.01] text-white text-xs font-black rounded-xl shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 uppercase tracking-widest transition-all duration-300 cursor-pointer">
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={14} />
            </Button>
          </form>

          <div className="mt-8 pt-5 border-t border-slate-100 w-full text-center">
             <p className="text-slate-400 text-sm font-semibold">
               Don't have an account? <Link to="/register" className="text-blue-600 font-extrabold hover:underline underline-offset-4 decoration-2">Register here</Link>
             </p>
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />
        </div>
      </motion.div>
    </div>
  );
}
