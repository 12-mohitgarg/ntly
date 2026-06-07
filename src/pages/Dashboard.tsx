import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import {
  BookOpen,
  FileCheck,
  UserCircle,
  Download,
  Video,
  Award,
  ChevronRight,
  Receipt,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import OfferLetter from './dashboard/OfferLetter';
import LMS from './dashboard/LMS';
import Assignments from './dashboard/Assignments';
import Profile from './dashboard/Profile';
import Certifications from './dashboard/Certifications';
import Notifications from './dashboard/Notifications';
import { Bell } from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useAuth();
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

  const menuItems = [
    { name: 'Offer Letter', path: '/dashboard', icon: Download },
    { name: 'Learning', path: '/dashboard/lms', icon: Video },
    { name: 'Assignments', path: '/dashboard/assignments', icon: FileCheck },
    { name: 'Certifications', path: '/dashboard/certs', icon: Award },
    { name: 'Profile', path: '/dashboard/profile', icon: UserCircle },
    { name: 'Notifications', path: '/dashboard/notifications', icon: Bell },
  ];

  return (
    <div className="student-shell flex flex-col lg:flex-row overflow-hidden relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.14),transparent_32%),radial-gradient(circle_at_85%_8%,rgba(16,185,129,0.12),transparent_30%)]" />

      {/* Sidebar */}
      <aside className="relative z-20 w-full shrink-0 border-b border-white/20 bg-slate-950/95 text-white shadow-2xl shadow-slate-950/20 backdrop-blur lg:sticky lg:top-24 lg:h-[calc(100vh-96px)] lg:w-80 lg:border-b-0 lg:border-r lg:border-white/10">
        <div className="flex h-full flex-col p-4 sm:p-6 lg:p-7">
          <div className="mb-5 rounded-3xl border border-white/10 bg-white/[0.06] p-4 lg:mb-8">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-blue-700 shadow-xl shadow-blue-950/20">
                {profile?.fullName?.charAt(0) || 'S'}
              </div>
              <div className="min-w-0">
                <p className="student-kicker text-blue-300">Student Workspace</p>
                <h4 className="truncate text-base font-black tracking-tight text-white">{profile?.fullName || 'Learner'}</h4>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl bg-white/[0.06] p-3">
                <p className="text-slate-400">Track</p>
                <p className="mt-1 truncate font-bold text-white">{profile?.internshipDomain || 'Not selected'}</p>
              </div>
              <div className="rounded-2xl bg-white/[0.06] p-3">
                <p className="text-slate-400">Progress</p>
                <p className="mt-1 font-bold text-emerald-300">{learningProgress}%</p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-3 hidden items-center gap-2 px-2 text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 lg:flex">
              <GraduationCap size={14} />
              Study Menu
            </div>
            <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`group flex min-w-fit items-center justify-between gap-3 rounded-2xl px-4 py-3 transition lg:w-full ${isActive
                      ? 'bg-white text-slate-950 shadow-xl shadow-white/10'
                      : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-300'} />
                      <span className="text-[11px] font-black uppercase tracking-[0.12em]">{item.name}</span>
                    </div>
                    {isActive && <ChevronRight size={14} className="hidden text-slate-400 lg:block" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="hidden p-7 pt-0 lg:block">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.18em] text-blue-200">
                <span>Learning Pace</span>
                <span>{learningProgress}%</span>
              </div>
              <div className="mb-5 h-2.5 w-full overflow-hidden rounded-full bg-slate-900 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${learningProgress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300 shadow-lg shadow-blue-600/30"
                />
              </div>
              <button
                onClick={downloadPaymentSlip}
                className="mb-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                <Receipt size={14} /> Payment Slip
              </button>
              <button className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-white/10">
                <Sparkles size={14} />
                Resume Track
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="relative z-10 w-full flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-10 xl:px-14">
        <div className="mx-auto h-full max-w-6xl">
          <Routes>
            <Route index element={<OfferLetter />} />
            <Route path="lms" element={<LMS />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="certs" element={<Certifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
          </Routes>
        </div>
      </main>
    </div>

  );
}
