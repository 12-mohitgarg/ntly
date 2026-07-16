import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { motion } from 'motion/react';
import { LogIn, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

export default function Navbar() {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Features', path: '/features' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-white/5 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 md:h-24 items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="flex items-center gap-3"
            >
              <img
                src="/logo.jpeg"
                alt="InternMitra Logo"
                className="h-14 w-24 object-contain md:h-18 md:w-32 rounded-lg"
              />
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-[11px] font-extrabold text-slate-400 hover:text-blue-400 transition-all uppercase tracking-[0.25em]"
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center gap-6">
                {isAdmin ? (
                  <Link to="/admin-dashboard">
                    <Button variant="outline" className="flex items-center gap-3 border-white/10 hover:border-blue-500 rounded-2xl hover:bg-blue-600 hover:text-white transition-all px-6 h-12 font-black uppercase text-[10px] tracking-widest shadow-sm text-white cursor-pointer">
                      <User size={18} />
                      <span>Admin Dashboard</span>
                    </Button>
                  </Link>
                ) : (
                  <Link to="/dashboard">
                    <Button variant="outline" className="flex items-center gap-3 border-white/10 hover:border-blue-500 rounded-2xl hover:bg-blue-600 hover:text-white transition-all px-6 h-12 font-black uppercase text-[10px] tracking-widest shadow-sm text-white cursor-pointer">
                      <User size={18} />
                      <span>Operations</span>
                    </Button>
                  </Link>
                )}
                <Button onClick={handleLogout} variant="ghost" size="icon" className="text-slate-400 hover:text-blue-400 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                  <LogOut size={20} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login">
                  <Button variant="ghost" className="text-slate-400 font-extrabold uppercase text-[10px] tracking-[0.2em] hover:text-blue-400 hover:bg-white/5 rounded-xl transition-all cursor-pointer">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] text-white rounded-2xl px-8 h-12 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-blue-600/10 transition-all duration-300 cursor-pointer">Join Now</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center justify-end gap-2 shrink-0">
            {user ? (
              <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 text-white shadow-sm flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <button
                    type="button"
                    className="h-10 px-4 rounded-2xl bg-blue-600 text-white font-extrabold text-[11px] flex items-center gap-1.5 shadow-lg shadow-blue-500/25 border border-blue-400/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-white" />
                    Login
                  </button>
                </Link>

                <Link to="/register">
                  <button
                    type="button"
                    className="h-10 px-4 rounded-2xl border-2 border-blue-500 bg-transparent text-blue-400 font-extrabold text-[11px] shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    Register
                  </button>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 text-white shadow-sm flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                >
                  <Menu size={18} />
                </button>
              </div>
            )}
          </div>
         
        </div>
      </div>

      {/* Mobile Nav Side Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          {/* Drawer content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-slate-950 shadow-2xl p-8 flex flex-col gap-6 border-l border-white/10 z-10"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Navigation</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-5 mt-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-bold text-slate-200 hover:text-blue-400 transition-colors py-2 border-b border-white/5"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-4">
              {user ? (
                <>
                  {isAdmin ? (
                    <Link to="/admin-dashboard" onClick={() => setIsOpen(false)} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all text-center">
                      <User size={16} className="inline mr-1" /> Admin Dashboard
                    </Link>
                  ) : (
                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all text-center">
                      <User size={16} className="inline mr-1" /> Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 text-[11px] font-black uppercase tracking-[0.16em] text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 text-[11px] font-black uppercase tracking-[0.16em] text-slate-300 hover:border-white/20 transition-all text-center">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all text-center">
                    Join Now
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </nav>
  );
}
