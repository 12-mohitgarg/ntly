import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import {
  LayoutDashboard,
  MapPin,
  GraduationCap,
  BookOpen,
  Building2,
  List,
  Youtube,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Home,
  Users,
  ListPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { adminProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
    { name: 'Districts', path: '/admin/districts', icon: MapPin },
    { name: 'Colleges', path: '/admin/colleges', icon: GraduationCap },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Universities', path: '/admin/universities', icon: Building2 },
    { name: 'Subjects', path: '/admin/subjects', icon: List },
    { name: 'Daily Videos', path: '/admin/daily-videos', icon: Youtube },
    { name: 'Bulk Add Colleges', path: '/admin/bulk-colleges', icon: ListPlus },
  ];

  const renderSidebarContent = (isMobile: boolean = false) => (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-col">
        {/* User Card */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-md shadow-blue-500/20">
              {adminProfile?.role === 'teacher' ? 'T' : 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">
                {adminProfile?.role === 'teacher' ? 'Teacher Portal' : 'Admin Area'}
              </p>
              <h4 className="truncate text-xs font-bold text-white mt-0.5" title={adminProfile?.email || 'Administrator'}>
                {adminProfile?.email?.split('@')[0] || 'Admin'}
              </h4>
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3 text-[10px] font-semibold">
            <p className="text-slate-400">Status</p>
            <p className="mt-0.5 font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Synchronized
            </p>
          </div>
        </div>

        {/* Menu Links */}
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Users size={12} />
            Control Center
          </div>
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              // Exact match or start of subpath for active state
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                  className={`group flex items-center justify-between gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ${isActive
                    ? 'bg-white text-slate-950 shadow-md shadow-white/5 font-bold'
                    : 'bg-white/[0.02] text-slate-400 hover:bg-white/[0.06] hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={16} className={isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-400'} />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">{item.name}</span>
                  </div>
                  {isActive && <ChevronRight size={12} className="text-slate-400" />}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer controls inside sidebar */}
      <div className="mt-8 pt-4 border-t border-white/5">
        <button
          onClick={() => {
            handleLogout();
            if (isMobile) setIsSidebarOpen(false);
          }}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-rose-600/90 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-rose-600/10 transition hover:bg-rose-500 active:scale-[0.98] cursor-pointer"
        >
          <LogOut size={12} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col relative">
      {/* Premium Admin Top Navbar */}
      <header className="bg-slate-950 text-white px-4 sm:px-6 lg:px-8 border-b border-white/5 shadow-xl sticky top-0 z-30 backdrop-blur-md bg-opacity-95 h-20 flex items-center">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Mobile view sidebar toggle trigger & Desktop view brand logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="flex-shrink-0 w-8 h-8 md:w-auto md:h-auto overflow-hidden md:overflow-visible flex items-center justify-start rounded-lg">
                <img
                  src="/logo-new.jpeg"
                  alt="Logo"
                  className="h-8 md:h-12 w-auto max-w-none object-cover md:object-contain rounded-lg"
                  style={{ filter: 'invert(1) brightness(100) contrast(100)', mixBlendMode: 'screen' }}
                />
              </div>
              <span className="hidden sm:inline-block text-sm font-black tracking-tight leading-none uppercase italic text-white font-sans">
                Console<span className="gradient-text-cyan">Center</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links (Home, About, Features, Contact) */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
              About
            </Link>
            <Link to="/features" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
              Features
            </Link>
            <Link to="/contact" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
              Contact
            </Link>
          </div>

          {/* User Profile / Status / Logout triggers */}
          <div className="flex items-center gap-4">
            {/* Desktop only profile info */}
            <div className="hidden sm:flex flex-col text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">
                {adminProfile?.role === 'teacher' ? 'Teacher' : 'Administrator'}
              </p>
              <h4 className="text-xs font-bold text-white mt-1 max-w-[150px] truncate leading-none">
                {adminProfile?.email?.split('@')[0] || 'Console'}
              </h4>
            </div>

            {/* Mobile Dropdown Menu button */}
            <div className="relative group">
              <button
                className="h-10 px-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black uppercase tracking-wider gap-1.5 active:scale-95 transition-all text-white cursor-pointer"
              >
                Menu
              </button>
              {/* Dropdown overlay */}
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-white/5 shadow-2xl p-2 hidden group-hover:block hover:block z-50">
                <Link to="/" className="flex w-full items-center px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-slate-300 hover:bg-white/5 hover:text-white">
                  Home
                </Link>
                <Link to="/about" className="flex w-full items-center px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-slate-300 hover:bg-white/5 hover:text-white">
                  About
                </Link>
                <Link to="/features" className="flex w-full items-center px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-slate-300 hover:bg-white/5 hover:text-white">
                  Features
                </Link>
                <Link to="/contact" className="flex w-full items-center px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-slate-300 hover:bg-white/5 hover:text-white">
                  Contact
                </Link>
                <div className="h-px bg-white/5 my-1" />
                <button
                  onClick={async () => {
                    await signOut(auth);
                    navigate('/login');
                  }}
                  className="flex w-full items-center px-4 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-left w-full cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.08),transparent_32%),radial-gradient(circle_at_85%_8%,rgba(6,182,212,0.06),transparent_30%)]" />

        {/* Desktop Sidebar (below top bar) */}
        <aside className="relative z-20 hidden lg:flex w-80 shrink-0 border-r border-slate-200/50 bg-slate-950/98 text-white shadow-2xl p-6 h-[calc(100vh-80px)] sticky top-20">
          {renderSidebarContent(false)}
        </aside>

        {/* Mobile Slide Drawer */}
        <AnimatePresence>
          {isSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              {/* Backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
              />
              {/* Drawer layout */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 z-50 w-76 bg-slate-950 text-white p-6 border-r border-white/10 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/5">
                  <span className="text-xs font-black uppercase tracking-widest text-blue-400">Admin Console</span>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto pr-1">
                  {renderSidebarContent(true)}
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main className="relative z-10 w-full flex-1 overflow-y-auto overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
          <div className="mx-auto h-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
