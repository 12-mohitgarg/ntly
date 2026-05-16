import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { LogIn, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Features', path: '/features' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="relative z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <img
                src="/logo.jpeg"
                alt="InternMitra Logo"
                className="h-24 w-40"
              />
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-[10px] font-black text-slate-500 hover:text-blue-600 transition-all uppercase tracking-[0.3em] italic"
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center gap-6">
                <Link to="/dashboard">
                  <Button variant="outline" className="flex items-center gap-3 border-slate-200 rounded-2xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all px-6 h-12 font-black uppercase text-[10px] tracking-widest italic shadow-sm shadow-slate-900/5">
                    <User size={18} />
                    <span>Operations</span>
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors">
                  <LogOut size={20} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login">
                  <Button variant="ghost" className="text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] italic hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-slate-900 hover:bg-blue-600 text-white rounded-2xl px-10 h-12 font-black uppercase text-[10px] tracking-[0.2em] italic shadow-xl shadow-slate-900/20 transition-all duration-300">Join Now</Button>
                </Link>
              </div>
            )}
          </div>


          {/* Mobile menu button */}
          {/* Mobile Buttons */}
          <div className="md:hidden flex items-center gap-3">

            {/* LOGIN */}
            <Link to="/login">
              <button
                className="
        h-11
        px-6
        rounded-[18px]
        bg-gradient-to-r
        from-blue-600
        via-indigo-600
        to-purple-600
        text-white
        font-bold
        text-sm
        flex
        items-center
        gap-2
        shadow-lg
        shadow-blue-500/30
        border
        border-blue-400/20
        active:scale-95
        transition-all
      "
              >

                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <LogIn className="w-3.5 h-3.5 text-white" />
                </div>

                LOGIN

              </button>
            </Link>

            {/* REGISTER */}
            <Link to="/register">
              <button
                className="
        h-11
        px-6
        rounded-[18px]
        border-2
        border-blue-500
        bg-white
        text-blue-600
        font-bold
        text-sm
        shadow-sm
        active:scale-95
        transition-all
      "
              >
                REGISTER
              </button>
            </Link>

          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-bottom border-gray-100 px-4 py-6 flex flex-col gap-4"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium text-gray-600"
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-gray-100" />
          {user ? (
            <div className="flex flex-col gap-4">
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-lg font-medium text-gray-600">
                <User size={20} />
                Dashboard
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-lg font-medium text-red-500 text-left">
                <LogOut size={20} />
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-5">

              <div className="bg-gradient-to-r from-blue-50 via-white to-purple-50 border border-blue-100 shadow-lg rounded-3xl p-4">

                <div className="flex items-center gap-3">

                  {/* Login Button */}
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    <button className="w-full h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center gap-2 text-slate-700 font-semibold text-sm hover:shadow-md hover:border-blue-300 transition-all duration-300">

                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <LogIn className="w-4 h-4 text-blue-600" />
                      </div>

                      Login

                    </button>
                  </Link>

                  {/* Register Button */}
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    <button className="relative overflow-hidden w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-xl shadow-blue-500/30 hover:scale-[1.03] transition-all duration-300">

                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          ✨
                        </div>

                        Register
                      </span>

                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-all duration-300" />

                    </button>
                  </Link>

                </div>

                {/* Bottom Text */}
                <p className="text-center text-[11px] text-slate-500 mt-4 font-medium tracking-wide">
                  🚀 Start your internship journey with Internmitra
                </p>

              </div>

            </div>
          )}
        </motion.div>
      )}
    </nav>
  );
}
