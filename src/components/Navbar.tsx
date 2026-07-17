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
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex-shrink-0 w-8 h-8 md:w-auto md:h-auto overflow-hidden md:overflow-visible rounded-lg flex items-center justify-start"
              >
                <img
                  src="/logo-new.jpeg"
                  alt="InternMitra Logo"
                  className="h-9 md:h-14 w-auto max-w-none object-contain rounded-xl shadow-sm border border-slate-100"
                />
              </motion.div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-all uppercase tracking-widest"
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <div className="flex items-center gap-4">
                  {isAdmin ? (
                    <Link to="/admin-dashboard">
                      <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-6 h-11 text-xs font-black uppercase tracking-widest shadow-sm cursor-pointer transition-all duration-300">
                        <User size={16} />
                        <span>Admin Panel</span>
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/dashboard">
                      <Button className="bg-blue-600 hover:bg-blue-500 hover:scale-[1.01] text-white rounded-2xl px-6 h-11 text-xs font-black uppercase tracking-widest shadow-md shadow-blue-500/10 cursor-pointer transition-all duration-300">
                        <User size={16} />
                        <span>Operations</span>
                      </Button>
                    </Link>
                  )}
                  <Button onClick={handleLogout} variant="ghost" size="icon" className="text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer">
                    <LogOut size={18} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login">
                    <Button variant="outline" className="border-blue-200 text-blue-600 font-extrabold uppercase text-xs tracking-widest hover:bg-blue-50/50 hover:border-blue-300 rounded-2xl px-5 h-11 transition-all duration-300 cursor-pointer">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl px-7 h-11 font-black uppercase text-xs tracking-widest shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                      Join Now
                    </Button>
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
                  className="h-10 w-10 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                >
                  {isOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <button
                      type="button"
                      className="h-10 px-3 rounded-2xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5 text-white" />
                      Login
                    </button>
                  </Link>

                  <Link to="/register">
                    <button
                      type="button"
                      className="h-10 px-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      Register
                    </button>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="h-10 w-10 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                  >
                    <Menu size={18} />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Nav Side Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[9999]"
          />
          {/* Drawer content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-8 flex flex-col gap-6 border-l border-slate-100 z-[10000]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Navigation</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4 mt-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-bold text-slate-700 hover:text-blue-600 transition-colors py-2 border-b border-slate-100"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-4">
              {user ? (
                <>
                  {isAdmin ? (
                    <Link to="/admin-dashboard" onClick={() => setIsOpen(false)} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 text-xs font-black uppercase tracking-widest text-white shadow-md hover:bg-slate-800 transition-all text-center">
                      <User size={16} /> Admin Dashboard
                    </Link>
                  ) : (
                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-xs font-black uppercase tracking-widest text-white shadow-md hover:bg-blue-500 transition-all text-center">
                      <User size={16} /> Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-red-200 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all text-center">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-xs font-black uppercase tracking-widest text-white shadow-md hover:opacity-95 transition-all text-center">
                    Join Now
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
