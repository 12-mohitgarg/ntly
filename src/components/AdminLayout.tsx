import React, { useEffect, useRef, useState } from 'react';
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
  ChevronDown,
  LogOut,
  Menu,
  X,
  Users,
  ListPlus,
  KeyRound,
  Upload,
  Search,
  Bell,
  Moon,
  Sun,
  Calendar,
  Layers,
  FileCheck,
  UserCheck,
  Building,
  Sliders,
  LogOut as LogOutIcon,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  ClipboardList,
  FileText,
  Download
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  
  const isTeacher = adminProfile?.role === 'teacher';
  const isSubUser = adminProfile?.role === 'sub_user';

  const handleLogout = async () => {
    try {
      setIsProfileMenuOpen(false);
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isProfileMenuOpen]);

  // Premium Categorized Sidebar Navigation Items
  const menuCategories = [
    {
      category: 'MAIN MENU',
      items: [
        { title: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
        { title: 'Cyber Cafe Summary', path: '/admin-dashboard?tab=cyber-cafe-summary', icon: Building },
        { title: 'Teachers', path: '/admin-dashboard?tab=teachers', icon: Users },
        { title: 'Sub Users', path: '/admin-dashboard?tab=sub-users', icon: UserCheck },
        { title: 'Notifications', path: '/admin-dashboard?tab=notifications', icon: Bell }
      ]
    },
    {
      category: 'USER MANAGEMENT',
      items: [
        { title: 'College Wise Users', path: '/admin-dashboard?tab=college-wise', icon: GraduationCap },
        { title: 'Domain Wise Users', path: '/admin-dashboard?tab=domain-wise', icon: Layers }
      ]
    },
    {
      category: 'REPORTS & EXPORTS',
      items: [
        { title: 'Test Report', path: '/admin-dashboard?tab=test-reports', icon: FileCheck },
        { title: 'Assignment', path: '/admin-dashboard?tab=student-reports', icon: ClipboardList },
        { title: 'Course Internship Reports', path: '/admin-dashboard?tab=reports', icon: FileText },
        { title: 'College Export', path: '/admin-dashboard?tab=college-export', icon: Download }
      ]
    },
    {
      category: 'ACADEMIC MANAGEMENT',
      items: [
        { title: 'Universities', path: '/admin/universities', icon: Building2 },
        { title: 'Colleges', path: '/admin/colleges', icon: GraduationCap },
        { title: 'Bulk Add Colleges', path: '/admin/bulk-colleges', icon: ListPlus },
        { title: 'Subjects', path: '/admin/subjects', icon: List },
        { title: 'Courses', path: '/admin/courses', icon: BookOpen },
        { title: 'Daily Videos', path: '/admin/daily-videos', icon: Youtube },
        { title: 'Import Students', path: '/admin/import-students', icon: Upload }
      ]
    },
    {
      category: 'SETTINGS',
      items: [
        { title: 'Districts', path: '/admin/districts', icon: MapPin },
        { title: 'Academic Settings', path: '/admin/payment-settings', icon: Sliders }
      ]
    }
  ];

  const isActivePath = (path: string) => {
    if (path === '/admin-dashboard' && location.pathname === '/admin-dashboard' && (!location.search || location.search === '?tab=dashboard')) {
      return true;
    }
    const currentTab = new URLSearchParams(location.search).get('tab');
    if (currentTab && path.includes('?tab=')) {
      const targetTab = new URLSearchParams(path.split('?')[1]).get('tab');
      if (currentTab === targetTab) return true;
      if ((currentTab === 'reports' || currentTab === 'internship-report') && (targetTab === 'reports' || targetTab === 'internship-report')) return true;
      if ((currentTab === 'student-reports' || currentTab === 'assignment') && (targetTab === 'student-reports' || targetTab === 'assignment')) return true;
      if ((currentTab === 'test-reports' || currentTab === 'test-report') && (targetTab === 'test-reports' || targetTab === 'test-report')) return true;
    }
    return location.pathname + location.search === path;
  };

  // Ultra-Premium Dark Sidebar Design
  const renderSidebar = () => (
    <div className="flex h-full flex-col justify-between bg-[#060a16] text-slate-300 font-sans select-none border-r border-[#121a2d] relative">
      
      {/* Mobile Sidebar Navigation Close Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800/80 bg-[#0b1120]">
        <div className="flex items-center gap-2.5">
          <img src="/logo-new.jpeg" alt="InternMitra Logo" className="h-8 w-auto rounded-lg bg-white p-0.5" />
          <span className="text-xs font-black text-white tracking-wide">Menu Navigation</span>
        </div>
        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* Administrator Profile Glassmorphism Card */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#0b1120] border border-slate-800/90 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg shadow-black/40">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-500 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-600/30 shrink-0 border border-blue-400/20">
            {adminProfile?.email?.charAt(0).toUpperCase() || 'A'}
          </div>

          <div className="min-w-0 flex-1 relative z-10">
            <h4 className="text-xs font-black text-white truncate leading-snug">
              {isTeacher ? 'Teacher Portal' : isSubUser ? 'Operator' : 'Administrator'}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400" />
              <span className="text-[10px] font-extrabold text-emerald-400 tracking-wide">Online</span>
            </div>
            <p className="text-[9px] text-slate-400 font-semibold truncate mt-0.5 tracking-tight">
              {adminProfile?.email || 'admin@internmitra.com'}
            </p>
          </div>
        </div>

        {/* Categorized Menu Section */}
        {menuCategories.map((group) => (
          <div key={group.category} className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <h5 className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">
                {group.category}
              </h5>
            </div>

            <nav className="space-y-1">
              {group.items.map((item) => {
                const active = isActivePath(item.path);
                return (
                  <Link
                    key={item.title}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group ${
                      active
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full shadow-xs" />
                    )}
                    <item.icon
                      size={16}
                      className={`transition-colors duration-200 ${
                        active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                      }`}
                    />
                    <span className="truncate tracking-wide">{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-900 bg-[#060a16]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-98 cursor-pointer shadow-xs"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>

    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex flex-col font-sans">
      
      {/* TOP HEADER BAR */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 h-16 flex items-center px-4 sm:px-6 lg:px-8 shadow-2xs">
        <div className="w-full max-w-[1700px] mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <Menu size={18} />
            </button>

            <Link to="/admin-dashboard" className="flex items-center gap-2.5 group">
              <img
                src="/logo-new.jpeg"
                alt="InternMitra Logo"
                className="h-10 w-auto object-contain rounded-xl bg-white p-1 border border-slate-200 shadow-2xs"
              />
              <span className="hidden sm:inline-block text-sm font-black tracking-tight text-slate-900 font-sans">
                Intern<span className="text-blue-600">Mitra</span>
              </span>
            </Link>
          </div>

          {/* Right Section Controls */}
          <div className="flex items-center gap-3 shrink-0">

            {/* Dynamic Real-time Date Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-100/80 border border-slate-200/80 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
              <Calendar size={14} className="text-blue-600" />
              <span>
                {new Date().toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  weekday: 'long'
                })}
              </span>
            </div>

            {/* Administrator Profile Pill */}
            <div ref={profileMenuRef} className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 p-1 pl-2.5 rounded-full bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 transition cursor-pointer"
              >
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-black text-slate-800 leading-tight">
                    {adminProfile?.email?.split('@')[0] || 'Administrator'}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 leading-tight">
                    {adminProfile?.email || 'admin@internmitra.com'}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow-sm">
                  {adminProfile?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-left"
                  >
                    <div className="p-2 border-b border-slate-100">
                      <p className="text-xs font-black text-slate-900">Administrator Console</p>
                      <p className="text-[10px] text-slate-500 truncate">{adminProfile?.email}</p>
                    </div>
                    <Link
                      to="/admin-dashboard"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl mt-1"
                    >
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl text-left cursor-pointer"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </header>

      {/* MAIN BODY AREA */}
      <div className="h-[calc(100vh-64px)] flex flex-row overflow-hidden">
        
        {/* Desktop Left Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 h-full bg-[#060a16] z-20">
          {renderSidebar()}
        </aside>

        {/* Mobile Sidebar Drawer */}
        <AnimatePresence>
          {isSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-[#060a16]"
              >
                {renderSidebar()}
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-[#f8fafc]">
          <div className="max-w-[1700px] mx-auto">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
