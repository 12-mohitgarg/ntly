import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { Handshake, LogIn, User, LogOut, Menu, X } from 'lucide-react';
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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-[#1e40af] rounded-full flex items-center justify-center border-4 border-blue-100 shadow-lg shadow-blue-600/10 transition-transform group-hover:rotate-12">
                <Handshake size={24} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tighter leading-none text-[#1e40af]">
                  Intern<span className="text-slate-900">Mitra</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-0.5">
                  Learn Skills. Earn stipend
                </span>
              </div>
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
                  <Button className="bg-slate-900 hover:bg-blue-600 text-white rounded-2xl px-10 h-12 font-black uppercase text-[10px] tracking-[0.2em] italic shadow-xl shadow-slate-900/20 transition-all duration-300">Join Engine</Button>
                </Link>
              </div>
            )}
          </div>


          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
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
            <div className="flex flex-col gap-4">
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-600">
                Login
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-orange-500 text-white">Join Now</Button>
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </nav>
  );
}
