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

export default function OfferLetter() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [headerImg, setHeaderImg] = useState<string>('');
  const [footerImg, setFooterImg] = useState<string>('');

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
  }, []);

  const generatePDF = () => {
    if (!headerImg || !footerImg) { alert('Images are still loading, please try again in a moment.'); return; }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, H = 297, ML = 14;

    const studentName = profile?.fullName || '[Student Full Name]';
    const rollNumber = profile?.universityRoll || '[Roll Number]';
    const college = profile?.college || '[Name Of College]';
    const deptSemester = `${profile?.department || 'B.A.(Pol. Sci.)'} - ${profile?.semester || '5th Semester'}`;
    const domain = profile?.internshipDomain || '[Domain as per Subject / Interest]';

    // ── IMAGE DIMENSIONS ──────────────────────────────────────────
    const headerH = (252 / 998) * W; // 52.97mm
    const footerH = (322 / 1002) * W; // 67.44mm

    // ── HEADER IMAGE ──────────────────────────────────────────────
    doc.addImage(headerImg, 'PNG', 0, 0, W, headerH);

    // ── BODY CONTENT ──────────────────────────────────────────────
    const x = ML;
    let y = headerH + 5;
    doc.setFontSize(8.5); doc.setTextColor(20, 20, 20);

    // Ref + Date
    doc.setFont('Helvetica', 'normal');
    doc.text('Letter Ref. No.: ', x, y);
    doc.setFont('Helvetica', 'bold');
    doc.text('IM/2026/IOL/10000', x + doc.getTextWidth('Letter Ref. No.: '), y);
    doc.setFont('Helvetica', 'normal');
    doc.text('Date: ....../......./2026', W - ML, y, { align: 'right' });
    y += 9;

    // To section
    doc.text('To,', x, y); y += 6;
    doc.setFont('Helvetica', 'bold');
    doc.text(`[${studentName}]`, x, y); y += 6;
    doc.setFont('Helvetica', 'normal');
    const urnL = 'University Roll Number: ';
    doc.text(urnL, x, y);
    doc.setFont('Helvetica', 'bold');
    doc.text(`[${rollNumber}]`, x + doc.getTextWidth(urnL), y); y += 6;
    doc.setFont('Helvetica', 'normal');
    const ciL = 'College / Institution: ';
    doc.text(ciL, x, y);
    doc.setFont('Helvetica', 'bold');
    doc.text(`[${college}]`, x + doc.getTextWidth(ciL), y); y += 9;

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
      ['Name of the Student', `[${studentName}]`],
      ['University Roll Number', `[${rollNumber}]`],
      ['College / Institution', `[${college}]`],
      ['Department & Semester', deptSemester],
      ['Internship Domain', `[${domain}]`],
      ['Internship Duration', '120 Hours'],
      ['Mode of Internship', 'Online (as approved by College)'],
      ['Internship Start Date', '[DD/MM/YYYY]'],
      ['Expected End Date', '[DD/MM/YYYY]'],
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
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-4 uppercase italic">Internship / <span className="text-blue-600">Offer Letter</span></h1>
           <p className="text-xl text-slate-500 font-bold italic leading-relaxed">"Your official authorization to begin the industrial scholarship program."</p>
        </div>
        <div className="p-6 px-8 bg-emerald-50 text-emerald-600 rounded-[2rem] border border-emerald-100 flex items-center gap-4 shadow-xl shadow-emerald-500/5 relative overflow-hidden group">
          <CheckCircle2 size={32} className="relative z-10" />
          <span className="text-xs font-black uppercase tracking-[0.2em] leading-tight relative z-10">Application <br/>Approved</span>
          <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-600/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform" />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {details.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/[0.02] flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600">
              <item.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.label}</p>
              <p className="text-sm font-black text-slate-900 truncate max-w-[150px]">{item.value || 'Not Set'}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white p-10 lg:p-20 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-900/[0.02] text-center relative overflow-hidden group">
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-blue-600/20 group-hover:rotate-12 transition-transform">
            <FileText size={48} className="text-white" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-8 tracking-tighter uppercase italic leading-none">Generate Official <br/>Offer Letter</h2>
          <p className="text-slate-500 font-bold italic mb-12 text-xl leading-relaxed">
            "Your offer letter is generated dynamically based on your verified registration records. Ensure all profile details are correct before downloading."
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={generatePDF}
              className="w-full sm:w-auto h-20 px-12 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all duration-500 flex items-center justify-center gap-4 group/btn"
            >
              <Download size={24} className="group-hover/btn:translate-y-1 transition-transform" />
              Download Official PDF
            </button>
            <div className="flex items-center gap-4 text-slate-400 font-black text-[10px] uppercase tracking-widest italic">
              <Calendar size={16} />
              Valid for IM/2026 Session
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl shadow-slate-900/40 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase italic">Need Changes?</h3>
          <p className="text-slate-400 font-bold italic text-lg leading-relaxed max-w-xl">"If your college or university details have changed, please update your profile before generating the document."</p>
        </div>
        <button onClick={() => navigate('/dashboard/profile')} className="relative z-10 h-16 px-10 bg-white/10 hover:bg-white/20 border border-white/5 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Go to Profile</button>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full" />
      </div>
    </div>
  );
}
