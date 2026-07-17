import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { signOut } from 'firebase/auth';
import {
  BookOpen,
  FileCheck,
  FileText,
  UserCircle,
  Download,
  Video,
  Award,
  ChevronRight,
  Receipt,
  GraduationCap,
  Sparkles,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import OfferLetter from './dashboard/OfferLetter';
import LMS from './dashboard/LMS';
import Assignments from './dashboard/Assignments';
import Profile from './dashboard/Profile';
import Certifications from './dashboard/Certifications';
import Notifications from './dashboard/Notifications';
import Reports from './dashboard/Reports';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentRecord, setPaymentRecord] = useState<any>(null);
  const [learningProgress, setLearningProgress] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchPayment = async () => {
      const q = query(collection(db, 'payments'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) setPaymentRecord({ id: snap.docs[0].id, ...snap.docs[0].data() });
    };
    fetchPayment();
  }, [user]);

  useEffect(() => {
    if (!user || !profile?.internshipDomain) {
      setLearningProgress(0);
      return;
    }

    const fetchLearningProgress = async () => {
      const course = profile.internshipDomain;
      const videosQuery = query(
        collection(db, 'dailyVideos'),
        where('course', '==', course)
      );
      const videosSnapshot = await getDocs(videosQuery);
      const uploadedDays = new Set(
        videosSnapshot.docs
          .map((videoDoc) => String(videoDoc.data().day || '').trim())
          .filter(Boolean)
      );

      if (uploadedDays.size === 0) {
        setLearningProgress(0);
        return;
      }

      const completedDays = new Set<string>();
      const progressRef = doc(db, 'userVideoProgress', `${user.uid}-${course}`);
      const progressSnapshot = await getDoc(progressRef);

      if (progressSnapshot.exists()) {
        const completedVideos = progressSnapshot.data().completedVideos || {};
        Object.entries(completedVideos).forEach(([day, completed]) => {
          const normalizedDay = String(day).trim();
          if (completed && uploadedDays.has(normalizedDay)) {
            completedDays.add(normalizedDay);
          }
        });
      }

      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('userId', '==', user.uid),
        where('course', '==', course)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      attendanceSnapshot.docs.forEach((attendanceDoc) => {
        const normalizedDay = String(attendanceDoc.data().day || '').trim();
        if (uploadedDays.has(normalizedDay)) {
          completedDays.add(normalizedDay);
        }
      });

      const progress = Math.round((completedDays.size / uploadedDays.size) * 100);
      setLearningProgress(progress);

      if (profile.progress !== progress) {
        await updateDoc(doc(db, 'users', user.uid), {
          progress,
          totalHoursCompleted: completedDays.size
        });
      }
    };

    fetchLearningProgress().catch((error) => {
      console.error('Error fetching learning progress:', error);
      setLearningProgress(profile?.progress || 0);
    });
  }, [user, profile?.internshipDomain, profile?.progress]);

  const downloadPaymentSlip = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, ML = 14, MR = 14;

    const name = profile?.fullName || 'N/A';
    const email = profile?.email || 'N/A';
    const contact = profile?.contactNumber || 'N/A';
    const college = profile?.college || 'N/A';
    const dept = profile?.department || 'N/A';
    const domain = profile?.internshipDomain || 'N/A';
    const roll = profile?.universityRoll || 'N/A';
    const paymentId = paymentRecord?.razorpayPaymentId || 'N/A';
    const orderId = paymentRecord?.razorpayOrderId || 'N/A';
    const amountValue = Number(paymentRecord?.amount || 0);
    const amount = amountValue > 0 ? `Rs. ${amountValue.toLocaleString('en-IN')}.00` : 'Rs. 700.00';
    const paidOn = paymentRecord?.timestamp
      ? new Date(paymentRecord.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
      : 'N/A';

    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, W, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('InternMitra', ML, 14);
    doc.setFontSize(8);
    doc.setFont('Helvetica', 'italic');
    doc.text('Internmitra Technologies Private Limited', ML, 20);
    doc.setFont('Helvetica', 'normal');
    doc.text('www.internmitra.com  |  info@internmitra.com  |  CIN: U78300BR2025PTC081140', ML, 26);

    doc.setFillColor(241, 245, 249);
    doc.rect(0, 30, W, 16, 'F');
    doc.setTextColor(30, 64, 175);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('FEE PAYMENT RECEIPT', W / 2, 41, { align: 'center' });

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8.5);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Receipt No: ${paymentId}`, ML, 56);
    doc.text(`Date: ${paidOn}`, W - MR, 56, { align: 'right' });

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(ML, 60, W - MR, 60);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 64, 175);
    doc.text('STUDENT DETAILS', ML, 68);
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.4);
    doc.line(ML, 70, ML + 38, 70);

    const studentRows: [string, string][] = [
      ['Full Name', name],
      ['Email Address', email],
      ['Contact Number', contact],
      ['University Roll No.', roll],
      ['College / Institution', college],
      ['Department', dept],
      ['Internship Domain', domain],
    ];

    let y = 78;
    doc.setLineWidth(0.2);
    doc.setDrawColor(226, 232, 240);
    studentRows.forEach(([label, value], i) => {
      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(ML, y - 4, W - ML - MR, 7, 'F');
      }
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(label, ML + 2, y);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(value, ML + 58, y);
      y += 7;
    });

    y += 6;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 64, 175);
    doc.text('PAYMENT DETAILS', ML, y);
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.4);
    doc.line(ML, y + 2, ML + 40, y + 2);

    y += 10;
    const payRows: [string, string][] = [
      ['Payment ID', paymentId],
      ['Order ID', orderId],
      ['Amount Paid', amount],
      ['Payment Mode', 'Razorpay (Online)'],
      ['Payment Status', 'SUCCESS'],
      ['Purpose', 'Internship Registration Fee'],
    ];

    payRows.forEach(([label, value], i) => {
      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(ML, y - 4, W - ML - MR, 7, 'F');
      }
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(label, ML + 2, y);
      doc.setFont('Helvetica', label === 'Payment Status' ? 'bold' : 'normal');
      doc.setTextColor(label === 'Payment Status' ? 22 : 15, label === 'Payment Status' ? 163 : 23, label === 'Payment Status' ? 74 : 42);
      doc.text(value, ML + 58, y);
      y += 7;
    });

    y += 10;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(134, 239, 172);
    doc.setLineWidth(0.4);
    doc.roundedRect(ML, y, W - ML - MR, 14, 2, 2, 'FD');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(22, 163, 74);
    doc.text(`PAYMENT CONFIRMED - ${amount} received successfully.`, W / 2, y + 8, { align: 'center' });

    y += 24;
    doc.setTextColor(148, 163, 184);
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.text('This is a computer-generated receipt and does not require a physical signature.', W / 2, y, { align: 'center' });
    doc.text('For queries: info@internmitra.com | 9693921517', W / 2, y + 5, { align: 'center' });

    doc.setFillColor(30, 64, 175);
    doc.rect(0, 287, W, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('InternMitra Technologies Pvt. Ltd.  |  Kisan Colony, Khagaul, Patna  |  CIN: U78300BR2025PTC081140', W / 2, 293, { align: 'center' });

    doc.save(`InternMitra_Payment_Slip_${name.replace(/\s+/g, '_')}.pdf`);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Offer Letter', path: '/dashboard', icon: Download },
    { name: 'Learning', path: '/dashboard/lms', icon: Video },
    { name: 'Internship Report', path: '/dashboard/assignments', icon: FileCheck },
    { name: 'Certifications', path: '/dashboard/certs', icon: Award },
    { name: 'Assignment Reports', path: '/dashboard/reports', icon: FileText },
    { name: 'Profile', path: '/dashboard/profile', icon: UserCircle },
    { name: 'Notifications', path: '/dashboard/notifications', icon: Bell },
  ];

  const renderSidebarContent = (isMobile: boolean = false) => (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-col">
        {/* User Card */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-md shadow-blue-500/10">
              {profile?.fullName?.charAt(0) || 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Student Area</p>
              <h4 className="truncate text-sm font-bold text-white mt-0.5">{profile?.fullName || 'Learner'}</h4>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold">
            <div className="rounded-xl bg-white/[0.04] p-2.5">
              <p className="text-slate-400">Domain</p>
              <p className="mt-0.5 truncate font-bold text-white">{profile?.internshipDomain || 'Not selected'}</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-2.5">
              <p className="text-slate-400">Progress</p>
              <p className="mt-0.5 font-bold text-emerald-400">{learningProgress}%</p>
            </div>
          </div>
        </div>

        {/* Menu Links */}
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <GraduationCap size={12} />
            Study Menu
          </div>
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                  className={`group flex items-center justify-between gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ${isActive
                    ? 'bg-white text-slate-950 shadow-md shadow-white/5'
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
      <div className="mt-8 pt-4 border-t border-white/5 space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-blue-300">
            <span>Progress bar</span>
            <span>{learningProgress}%</span>
          </div>

          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-900 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${learningProgress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 shadow-sm"
            />
          </div>

          <button
            onClick={() => {
              downloadPaymentSlip();
              if (isMobile) setIsSidebarOpen(false);
            }}
            className="mb-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-blue-600/10 transition hover:bg-blue-500 active:scale-[0.98]"
          >
            <Receipt size={12} />
            Payment Slip
          </button>

          <button
            onClick={() => {
              if (isMobile) setIsSidebarOpen(false);
            }}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-white/10"
          >
            <Sparkles size={12} />
            Resume Track
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col relative">
      {/* Premium Dashboard Top Navbar */}
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
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/logo.jpeg"
                alt="Logo"
                className="h-10 md:h-12 w-auto object-contain rounded-lg"
                style={{ filter: 'invert(1)', mixBlendMode: 'screen' }}
              />
              <span className="hidden sm:inline-block text-sm font-black tracking-tight leading-none uppercase italic text-white">
                Intern<span className="gradient-text-cyan">Mitra</span>
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
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Student Area</p>
              <h4 className="text-xs font-bold text-white mt-1 max-w-[150px] truncate leading-none">
                {profile?.fullName || 'Learner'}
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
                  <span className="text-xs font-black uppercase tracking-widest text-blue-400">Workspace Menu</span>
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
          <div className="mx-auto h-full max-w-6xl">
            <Routes>
              <Route index element={<OfferLetter />} />
              <Route path="lms" element={<LMS />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="certs" element={<Certifications />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<Profile />} />
              <Route path="notifications" element={<Notifications />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
