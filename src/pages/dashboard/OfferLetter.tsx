import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Download, 
  FileText, 
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  User,
  Hash
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, runTransaction, increment } from 'firebase/firestore';

export default function OfferLetter() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [headerImg, setHeaderImg] = useState<string>('');
  const [footerImg, setFooterImg] = useState<string>('');
  const [watermarkImg, setWatermarkImg] = useState<string>('');
  const [offerLetterNumber, setOfferLetterNumber] = useState<string>('');

  useEffect(() => {
    const loadImg = (src: string, setter: (d: string) => void) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) { ctx.drawImage(img, 0, 0); setter(canvas.toDataURL('image/png')); }
      };
      img.src = src;
    };
    loadImg('/ii.png', setHeaderImg);
    loadImg('/ff.png', setFooterImg);
    loadImg('/dded.jpeg', setWatermarkImg);
  }, []);

  const getOfferLetterNumber = async (): Promise<string> => {
    if (!user) return '10000';

    // Check if user already has an offer letter number
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    if (userData?.offerLetterNumber) {
      return userData.offerLetterNumber;
    }

    // Get next sequential number using transaction
    const counterRef = doc(db, 'counters', 'offerLetter');
    const nextNumber = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      if (!counterDoc.exists()) {
        // Initialize counter starting from 10001
        transaction.set(counterRef, { count: 10001, lastUpdated: new Date().toISOString() });
        return 10001;
      }

      const currentCount = counterDoc.data().count;
      const newCount = currentCount + 1;
      transaction.update(counterRef, { count: newCount, lastUpdated: new Date().toISOString() });
      
      return newCount;
    });

    // Save the number to user's profile
    await updateDoc(doc(db, 'users', user.uid), { offerLetterNumber: nextNumber.toString() });
    
    return nextNumber.toString();
  };

  const generatePDF = async () => {
    if (!headerImg || !footerImg) { alert('Images are still loading, please try again in a moment.'); return; }

    // Get the sequential offer letter number
    const letterNumber = await getOfferLetterNumber();

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, H = 297, ML = 14;

    const studentName = profile?.fullName || '[Student Full Name]';
    const rollNumber = profile?.universityRoll || '[Roll Number]';
    const college = profile?.college || '[Name Of College]';
    const deptSemester = `${profile?.department || 'B.A.(Pol. Sci.)'} - ${profile?.semester || '5th Semester'}`;
    const domain = profile?.internshipDomain || '[Domain as per Subject / Interest]';

    const formatDate = (iso: string | undefined) => {
      if (!iso) return '........./........./2026';
      const d = new Date(iso);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };
    const letterDate = formatDate(profile?.registrationDate);

    // ── IMAGE DIMENSIONS ──────────────────────────────────────────
    const headerH = (252 / 998) * W; // 52.97mm
    const footerH = (322 / 1002) * W; // 67.44mm

    // ── HEADER IMAGE ──────────────────────────────────────────────
    doc.addImage(headerImg, 'PNG', 0, 0, W, headerH);

    // ── WATERMARK ─────────────────────────────────────────────────
    if (watermarkImg) {
      const wmSize = 90;
      const wmX = (W - wmSize) / 2;
      const wmY = (H - wmSize) / 2;
      (doc as any).saveGraphicsState();
      (doc as any).setGState((doc as any).GState({ opacity: 0.12 }));
      doc.addImage(watermarkImg, 'JPEG', wmX, wmY, wmSize, wmSize);
      (doc as any).restoreGraphicsState();
    }

    // ── BODY CONTENT ──────────────────────────────────────────────
    const x = ML;
    let y = headerH + 5;
    doc.setFontSize(8.5); doc.setTextColor(20, 20, 20);

    // Ref + Date
    doc.setFont('Helvetica', 'normal');
    doc.text('Letter Ref. No.: ', x, y);
    doc.setFont('Helvetica', 'bold');
    doc.text(`IM/2026/IOL/${letterNumber}`, x + doc.getTextWidth('Letter Ref. No.: '), y);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Date: ${letterDate}`, W - ML, y, { align: 'right' });
    y += 9;

    // To section
    doc.text('To,', x, y); y += 6;
    doc.setFont('Helvetica', 'bold');
    doc.text(profile?.fullName ? studentName : `[${studentName}]`, x, y); y += 6;
    doc.setFont('Helvetica', 'normal');
    const urnL = 'University Roll Number: ';
    doc.text(urnL, x, y);
    doc.setFont('Helvetica', 'bold');
    doc.text(profile?.universityRoll ? rollNumber : `[${rollNumber}]`, x + doc.getTextWidth(urnL), y); y += 6;
    doc.setFont('Helvetica', 'normal');
    const ciL = 'College / Institution: ';
    doc.text(ciL, x, y);
    doc.setFont('Helvetica', 'bold');
    doc.text(profile?.college ? college : `[${college}]`, x + doc.getTextWidth(ciL), y); y += 9;

    // Dear Candidate + body paragraph
    doc.setFont('Helvetica', 'normal');
    doc.text('Dear Candidate,', x, y); y += 6;
    const bodyText = `We are pleased to accept your application and formally offer you an internship at Internmitra Technologies Private Limited(InternMitra). Our internship programmes are designed in full alignment with NEP-2020, AICTE and UGC Internship Guidelines, and your university's specific internship framework.`;
    const splitBody = doc.splitTextToSize(bodyText, W - 2 * ML);
    doc.text(splitBody, x, y); y += splitBody.length * 4.6 + 7;

    // Details header
    doc.setFont('Helvetica', 'bold');
    doc.text('Your internship details are as follows:', x, y); y += 7;

    // Details table
    const colC = 76, colV = 80, rH = 6.5;
    const rows: [string, string][] = [
      ['Name of the Student', profile?.fullName ? studentName : `[${studentName}]`],
      ['University Roll Number', profile?.universityRoll ? rollNumber : `[${rollNumber}]`],
      ['College / Institution', profile?.college ? college : `[${college}]`],
      ['Department & Semester', deptSemester],
      ['Internship Domain', profile?.internshipDomain ? domain : `[${domain}]`],
      ['Internship Duration', '120 Hours'],
      ['Mode of Internship', 'Online (as approved by College)'],
      ['Internship Start Date', '01/06/2026'],
      ['Expected End Date', '20/06/2026'],
      ['Stipend', 'Not Applicable \u2014 Academic Programme'],
    ];
    rows.forEach(([label, value]) => {
      doc.setFont('Helvetica', 'normal'); doc.setTextColor(20, 20, 20);
      doc.text(label, x + 8, y);
      doc.text(':', colC, y);
      doc.setFont('Helvetica', 'bold');
      doc.text(value, colV, y);
      y += rH;
    });
    y += 5;

    // Closing paragraphs
    doc.setFont('Helvetica', 'normal');
    const closing = `Please report to us on your start date as per the schedule above and bring this letter along with the Consent Letter issued by your College. We also request that you inform your College Internship Nodal Officer (CINO) upon receiving this acceptance letter. During the programme, you are required to maintain the minimum required attendance and complete all tasks and assignments given by your mentor.`;
    const splitClose = doc.splitTextToSize(closing, W - 2 * ML);
    doc.text(splitClose, x, y); y += splitClose.length * 4.6 + 5;

    const lastLine = `We look forward to a meaningful and enriching internship experience and appreciate your interest in InternMitra.`;
    const splitLast = doc.splitTextToSize(lastLine, W - 2 * ML);
    doc.text(splitLast, x, y);

    // ── FOOTER IMAGE ──────────────────────────────────────────────
    doc.addImage(footerImg, 'PNG', 0, H - footerH, W, footerH);

    doc.save(`InternMitra_Offer_Letter_${studentName.replace(/\s+/g, '_')}.pdf`);
  };


  const details = [
    { label: 'Student Identity', value: profile?.fullName, icon: User },
    { label: 'Academic Roll', value: profile?.universityRoll, icon: Hash },
    { label: 'Campus/College', value: profile?.college, icon: Building2 },
    { label: 'Internship Path', value: profile?.internshipDomain, icon: ShieldCheck },
  ];

  return (
    <div className="student-page">
      <header className="student-card overflow-hidden p-5 sm:p-7 lg:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="student-kicker">Document Desk</p>
            <h1 className="student-title mt-2">Internship Offer Letter</h1>
            <p className="student-subtitle">Your verified internship joining document is ready from the details saved in your profile.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-700">
            <CheckCircle2 size={24} />
            <span className="text-[11px] font-black uppercase tracking-[0.16em] leading-tight">Application Approved</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {details.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="student-card flex items-center gap-4 p-4 sm:p-5"
          >
            <div className="student-icon">
              <item.icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="student-label">{item.label}</p>
              <p className="truncate text-sm font-black text-slate-900">{item.value || 'Not Set'}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="student-card relative overflow-hidden p-6 text-center sm:p-10 lg:p-14">
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mx-auto mb-7 flex size-20 items-center justify-center rounded-3xl bg-slate-950 text-white shadow-2xl shadow-slate-950/15">
            <FileText size={38} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">Generate Official Offer Letter</h2>
          <p className="mx-auto mb-8 mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-600 sm:text-base">
            Your PDF uses verified registration records. Please confirm your name, roll number, college, and domain before downloading.
          </p>

          <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <button onClick={generatePDF} className="student-button-primary w-full sm:w-auto">
              <Download size={20} />
              Download Official PDF
            </button>
            <div className="flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
              <Calendar size={16} />
              Valid for IM/2026 Session
            </div>
          </div>
        </div>

        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-100/60 blur-3xl" />
      </div>

      <div className="student-panel flex flex-col gap-6 overflow-hidden p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
        <div className="relative z-10">
          <h3 className="text-xl font-black tracking-tight sm:text-2xl">Need to update details?</h3>
          <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-400">Update your profile before generating the document if any academic detail has changed.</p>
        </div>
        <button onClick={() => navigate('/dashboard/profile')} className="relative z-10 w-full rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-white/15 sm:w-auto">Go to Profile</button>
      </div>
    </div>
  );
}
