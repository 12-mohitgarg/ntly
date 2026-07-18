import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { loadImageAsDataUrl } from '../lib/offerLetterPdf';
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
  X,
  BarChart2,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, doc, getDoc, getDocs, limit, query, updateDoc, where } from 'firebase/firestore';
import { jsPDF } from 'jspdf';

const MainDashboard = lazy(() => import('./dashboard/MainDashboard'));
const OfferLetter = lazy(() => import('./dashboard/OfferLetter'));
const LMS = lazy(() => import('./dashboard/LMS'));
const Assignments = lazy(() => import('./dashboard/Assignments'));
const Profile = lazy(() => import('./dashboard/Profile'));
const Certifications = lazy(() => import('./dashboard/Certifications'));
const Notifications = lazy(() => import('./dashboard/Notifications'));
const Reports = lazy(() => import('./dashboard/Reports'));

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentRecord, setPaymentRecord] = useState<any>(null);
  const [learningProgress, setLearningProgress] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!user) return;
    const fetchPayment = async () => {
      const q = query(collection(db, 'payments'), where('userId', '==', user.uid), limit(1));
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

      const progressRef = doc(db, 'userVideoProgress', `${user.uid}-${course}`);
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('userId', '==', user.uid),
        where('course', '==', course)
      );
      const [progressSnapshot, attendanceSnapshot] = await Promise.all([
        getDoc(progressRef),
        getDocs(attendanceQuery)
      ]);

      const completedDays = new Set<string>();
      if (progressSnapshot.exists()) {
        const completedVideos = progressSnapshot.data().completedVideos || {};
        Object.entries(completedVideos).forEach(([day, completed]) => {
          const normalizedDay = String(day).trim();
          if (completed && uploadedDays.has(normalizedDay)) {
            completedDays.add(normalizedDay);
          }
        });
      }

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

  const downloadPaymentSlip = async () => {
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

    try {
      const [headerImg, footerImg] = await Promise.all([
        loadImageAsDataUrl('/receipt_header.png', 'image/jpeg'),
        loadImageAsDataUrl('/receipt_footer.png', 'image/jpeg')
      ]);

      // Render custom header image (1024x263 aspect ratio ~3.89, W=210 -> H=54)
      doc.addImage(headerImg, 'JPEG', 0, 0, W, 54);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(8.5);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Receipt No: ${paymentId}`, ML, 66);
      doc.text(`Date: ${paidOn}`, W - MR, 66, { align: 'right' });

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(ML, 70, W - MR, 70);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 64, 175);
      doc.text('STUDENT DETAILS', ML, 79);
      doc.setDrawColor(30, 64, 175);
      doc.setLineWidth(0.4);
      doc.line(ML, 81, ML + 38, 81);

      const studentRows: [string, string][] = [
        ['Full Name', name],
        ['Email Address', email],
        ['Contact Number', contact],
        ['University Roll No.', roll],
        ['College / Institution', college],
        ['Department', dept],
        ['Internship Domain', domain],
      ];

      let y = 89;
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

      y += 8;
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

      // Render custom footer image (1024x62 aspect ratio ~16.45, W=210 -> H=13)
      doc.addImage(footerImg, 'JPEG', 0, 297 - 13, W, 13);
    } catch (err) {
      console.error('Error loading receipt assets:', err);
      // Fallback text header if images fail to load
      doc.setFillColor(30, 64, 175);
      doc.rect(0, 0, W, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('InternMitra', ML, 14);
    }

    doc.save(`InternMitra_Payment_Slip_${name.replace(/\s+/g, '_')}.pdf`);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart2 },
    { name: 'Course', path: '/dashboard/lms', icon: GraduationCap },
    { name: 'Assignments', path: '/dashboard/assignments', icon: FileCheck },
    { name: 'Certifications', path: '/dashboard/certs', icon: Award },
    { name: 'Reports', path: '/dashboard/reports', icon: FileText },
    { name: 'Profile', path: '/dashboard/profile', icon: UserCircle },
  ];

  const isLinkActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative text-gray-800">
      
      {/* Top Header Navbar */}
      <header className="bg-white border-b border-gray-200/80 shadow-sm sticky top-0 z-30 h-20 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Logo & Mobile trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden h-10 w-10 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-center text-gray-600 active:scale-95 transition cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="flex-shrink-0 w-8 h-8 md:w-auto md:h-auto overflow-hidden md:overflow-visible flex items-center justify-start rounded-lg">
                <img
                  src="/logo-new.jpeg"
                  alt="Logo"
                  className="h-8 md:h-11 w-auto max-w-none object-contain rounded-lg"
                />
              </div>
              <span className="hidden sm:inline-block text-sm font-black tracking-wider leading-none uppercase italic text-slate-900">
                Intern<span className="text-blue-600">Mitra</span>
              </span>
            </Link>
          </div>

          {/* Desktop Central Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => {
              const active = isLinkActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`font-semibold transition-all duration-300 relative group flex items-center space-x-2 py-2 ${
                    active ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <item.icon size={16} className={active ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'} />
                  <span className="text-sm font-semibold">{item.name}</span>
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-violet-600 transition-all duration-300 group-hover:w-full ${
                    active ? 'w-full' : 'w-0'
                  }`} />
                </Link>
              );
            })}
          </nav>

          {/* Right Profile & Menu Dropdown */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none">Student Workspace</p>
              <h4 className="text-xs font-extrabold text-gray-900 mt-1 max-w-[140px] truncate leading-none">
                {profile?.fullName || 'Learner'}
              </h4>
            </div>

            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((open) => !open)}
                aria-expanded={isProfileMenuOpen}
                className="h-10 px-4 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-center text-[10px] font-black uppercase tracking-widest gap-1.5 active:scale-95 transition-all text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Menu
              </button>
              
              {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-gray-200 shadow-xl p-2 z-50">
                <Link onClick={() => setIsProfileMenuOpen(false)} to="/dashboard" className="flex w-full items-center px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50">
                  Dashboard
                </Link>
                <Link onClick={() => setIsProfileMenuOpen(false)} to="/dashboard/profile" className="flex w-full items-center px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50">
                  Profile
                </Link>
                {paymentRecord && (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      downloadPaymentSlip();
                    }}
                    className="flex w-full items-center px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 text-left cursor-pointer"
                  >
                    Payment Slip
                  </button>
                )}
                <div className="h-px bg-gray-150 my-1" />
                <button
                  onClick={async () => {
                    setIsProfileMenuOpen(false);
                    await signOut(auth);
                    navigate('/login');
                  }}
                  className="flex w-full items-center px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 text-left cursor-pointer"
                >
                  Logout
                </button>
              </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Mobile Sidebar Side-drawer */}
        <AnimatePresence>
          {isSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white text-gray-800 p-6 border-r border-gray-200 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-150">
                    <span className="text-sm font-extrabold uppercase tracking-widest text-blue-600">Student Workspace</span>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-450 uppercase tracking-wider px-2">Navigation Menu</h3>
                    <nav className="space-y-1">
                      {menuItems.map((item) => {
                        const active = isLinkActive(item.path);
                        return (
                          <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center justify-between py-3.5 px-4 rounded-xl transition-all duration-200 border ${
                              active
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border-blue-200 shadow-sm font-semibold'
                                : 'text-gray-700 border-transparent hover:bg-gray-50 hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center space-x-3.5">
                              <item.icon size={18} className={active ? 'text-blue-600' : 'text-gray-400'} />
                              <span className="text-sm font-medium">{item.name}</span>
                            </div>
                            {active && <ChevronRight size={14} className="text-blue-500" />}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </div>

                {/* Mobile Drawer Footer Actions */}
                <div className="pt-4 border-t border-gray-150 space-y-3">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {profile?.fullName?.charAt(0) || 'S'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{profile?.fullName || 'Learner'}</p>
                      <p className="text-[10px] text-gray-500 truncate">{profile?.internshipDomain}</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      setIsSidebarOpen(false);
                      await signOut(auth);
                      navigate('/login');
                    }}
                    className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* Subpage Container */}
        <main className="relative z-10 w-full flex-1 overflow-y-auto overflow-x-hidden py-10 px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto h-full max-w-6xl">
            <Suspense fallback={<div className="student-card p-8 text-center font-black text-slate-500">Loading...</div>}>
              <Routes>
                <Route index element={<MainDashboard />} />
                <Route path="offer-letter" element={<OfferLetter />} />
                <Route path="lms/*" element={<LMS />} />
                <Route path="assignments" element={<Assignments />} />
                <Route path="certs" element={<Certifications />} />
                <Route path="reports" element={<Reports />} />
                <Route path="profile" element={<Profile />} />
                <Route path="notifications" element={<Notifications />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
