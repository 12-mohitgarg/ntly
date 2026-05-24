import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import {
  BarChart3,
  BookOpen,
  MessageSquare,
  FileCheck,
  UserCircle,
  Download,
  Video,
  Award,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import OfferLetter from './dashboard/OfferLetter';
import LMS from './dashboard/LMS';
import Assignments from './dashboard/Assignments';
import Profile from './dashboard/Profile';
import Certifications from './dashboard/Certifications';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [paymentRecord, setPaymentRecord] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const fetchPayment = async () => {
      const q = query(collection(db, 'payments'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) setPaymentRecord({ id: snap.docs[0].id, ...snap.docs[0].data() });
    };
    fetchPayment();
  }, [user]);

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
    const amount = paymentRecord?.amount ? `Rs. ${paymentRecord.amount}.00` : 'Rs. 700.00';
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
    doc.text('PAYMENT CONFIRMED — Rs. 500.00 received successfully.', W / 2, y + 8, { align: 'center' });

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
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col lg:flex-row overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none -mr-40 -mt-40" />

      {/* Sidebar */}
      <aside className="w-full lg:w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 lg:sticky lg:top-24 lg:h-[calc(100vh-96px)] relative z-20">
        <div className="p-10 flex-1 flex flex-col">
          <div className="flex items-center gap-5 mb-14 bg-slate-800/50 p-5 rounded-[2rem] border border-slate-700/50">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-600/20 border-4 border-slate-800 transition-transform hover:rotate-6">
              {profile?.fullName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] mb-1 italic">Authorized</p>
              <h4 className="text-sm font-black text-white truncate tracking-tighter uppercase italic">{profile?.fullName}</h4>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-4 pl-2 opacity-50 italic">Control Subsystems</h3>
            <nav className="space-y-3">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-500 group ${isActive
                        ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/20 translate-x-2'
                        : 'text-slate-500 hover:text-white hover:bg-slate-800'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-600 group-hover:text-blue-500 transition-colors'} />
                      <span className={`text-[10px] font-black uppercase tracking-[0.15em] italic ${isActive ? 'text-white' : ''}`}>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight size={14} className="text-white/50" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-10 mt-auto">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 italic">
                <span>Efficiency</span>
                <span>{profile?.progress || 0}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden mb-6 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${profile?.progress || 0}%` }}
                  className="bg-blue-600 h-full rounded-full shadow-lg shadow-blue-600/40"
                />
              </div>
              <button
                onClick={downloadPaymentSlip}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-3 shadow-lg shadow-blue-600/20"
              >
                <Receipt size={14} /> Payment Slip
              </button>
              <button className="w-full h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
                Resume Track
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full" />
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-10 lg:p-20 overflow-y-auto w-full relative z-10">
        <div className="max-w-6xl mx-auto h-full">
          <Routes>
            <Route index element={<OfferLetter />} />
            <Route path="lms" element={<LMS />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="certs" element={<Certifications />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </div>
      </main>
    </div>

  );
}
