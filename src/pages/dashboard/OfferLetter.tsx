import React from 'react';
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

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, H = 297, ML = 13, MR = 13;

    const studentName = profile?.fullName || '[Student Full Name]';
    const rollNumber = profile?.universityRoll || '[Roll Number]';
    const college = profile?.college || '[Name Of College]';
    const deptSemester = `${profile?.department || 'B.A.(Pol. Sci.)'} - ${profile?.semester || '5th Semester'}`;
    const domain = profile?.internshipDomain || '[Domain as per Subject / Interest]';

    // --- TOP-LEFT BLUE TRIANGLE ---
    doc.setFillColor(30, 64, 175);
    doc.lines([[44, 0], [-44, 54]], 0, 0, [1, 1], 'F', true);
    doc.setFillColor(59, 130, 246);
    doc.lines([[22, 0], [-22, 27]], 0, 0, [1, 1], 'F', true);

    // --- TOP-RIGHT BLUE TRIANGLE ---
    doc.setFillColor(30, 64, 175);
    doc.lines([[-30, 0], [30, 36]], W, 0, [1, 1], 'F', true);
    doc.setFillColor(59, 130, 246);
    doc.lines([[-14, 0], [14, 17]], W, 0, [1, 1], 'F', true);

    // --- LOGO BOX ---
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(ML, 10, 20, 20, 2.5, 2.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('Helvetica', 'bold');
    doc.text('IM', ML + 10, 22, { align: 'center' });

    // --- COMPANY NAME + TAGLINE ---
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(18);
    doc.setFont('Helvetica', 'bold');
    doc.text('InternMitra', ML + 24, 19);
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.setFont('Helvetica', 'italic');
    doc.text('Learn Skills. Earn Stipend', ML + 24, 25.5);

    // --- CONTACT INFO (right) ---
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(7.5);
    doc.setFont('Helvetica', 'normal');
    doc.text('www.internmitra.com', 138, 12);
    doc.text('9693921517, 9631185896', 138, 18);
    doc.text('info@internmitra.com', 138, 24);
    doc.text('Kisan Colony, Khagaul, Patna', 138, 30);

    // --- CIN ---
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');
    doc.text('CIN : U78300BR2025PTC081140', ML, 38);

    // --- DOUBLE SEPARATOR LINES ---
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.5);
    doc.line(ML, 41, W - MR, 41);
    doc.line(ML, 43.5, W - MR, 43.5);

    // --- TITLE ---
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text('INTERNSHIP OFFER LETTER', W / 2, 50.5, { align: 'center' });

    // --- DOUBLE LINES BELOW TITLE ---
    doc.setDrawColor(30, 41, 59);
    doc.line(ML, 53.5, W - MR, 53.5);
    doc.line(ML, 56, W - MR, 56);

    // --- REF + DATE ---
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8.5);
    doc.setFont('Helvetica', 'normal');
    doc.text('Letter Ref. No.: IM/2026/IOL/10000', ML, 63);
    doc.text('Date: ....../......./2026', W - MR, 63, { align: 'right' });

    // --- TO SECTION ---
    doc.text('To,', ML, 71);
    doc.setFont('Helvetica', 'bold');
    doc.text(studentName, ML, 77);
    doc.setFont('Helvetica', 'normal');
    const urnLabel = 'University Roll Number: ';
    doc.text(urnLabel, ML, 83);
    doc.setFont('Helvetica', 'bold');
    doc.text(rollNumber, ML + doc.getTextWidth(urnLabel), 83);
    doc.setFont('Helvetica', 'normal');
    const ciLabel = 'College / Institution: ';
    doc.text(ciLabel, ML, 89);
    doc.setFont('Helvetica', 'bold');
    doc.text(college, ML + doc.getTextWidth(ciLabel), 89);

    // --- DEAR CANDIDATE + BODY ---
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('Dear Candidate,', ML, 97);
    const bodyText = `We are pleased to accept your application and formally offer you an internship at Internmitra Technologies Private Limited(InternMitra). Our internship programmes are designed in full alignment with NEP-2020, AICTE and UGC Internship Guidelines, and your university's specific internship framework.`;
    const splitBody = doc.splitTextToSize(bodyText, W - ML - MR);
    doc.text(splitBody, ML, 103);

    // --- DETAILS HEADER ---
    let y = 103 + splitBody.length * 4.5 + 5;
    doc.setFont('Helvetica', 'bold');
    doc.text('Your internship details are as follows:', ML, y);

    // --- DETAILS TABLE ---
    const colLabel = 20, colColon = 76, colVal = 80, rH = 6.5;
    y += 7;
    const rows: [string, string][] = [
      ['Name of the Student', studentName],
      ['University Roll Number', rollNumber],
      ['College / Institution', college],
      ['Department & Semester', deptSemester],
      ['Internship Domain', domain],
      ['Internship Duration', '120 Hours'],
      ['Mode of Internship', 'Online (as approved by College)'],
      ['Internship Start Date', '[DD/MM/YYYY]'],
      ['Expected End Date', '[DD/MM/YYYY]'],
      ['Stipend', 'Not Applicable — Academic Programme'],
    ];
    rows.forEach(([label, value]) => {
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(label, colLabel, y);
      doc.text(':', colColon, y);
      doc.setFont('Helvetica', 'bold');
      doc.text(value, colVal, y);
      y += rH;
    });

    // --- CLOSING ---
    y += 4;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    const closing = `Please report to us on your start date as per the schedule above and bring this letter along with the Consent Letter issued by your College. We also request that you inform your College Internship Nodal Officer (CINO) upon receiving this acceptance letter. During the programme, you are required to maintain the minimum required attendance and complete all tasks and assignments given by your mentor.`;
    const splitClosing = doc.splitTextToSize(closing, W - ML - MR);
    doc.text(splitClosing, ML, y);

    y += splitClosing.length * 4.5 + 5;
    const lastLine = `We look forward to a meaningful and enriching internship experience and appreciate your interest in InternMitra.`;
    const splitLast = doc.splitTextToSize(lastLine, W - ML - MR);
    doc.text(splitLast, ML, y);

    // --- SIGNATURE ---
    y += splitLast.length * 4.5 + 10;
    const sigX = W - 42;
    doc.setLineWidth(0.3);
    doc.setDrawColor(30, 41, 59);
    doc.line(sigX - 20, y + 5, sigX + 20, y + 5);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Mr. Amarjeet kumar', sigX, y + 11, { align: 'center' });
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('Founder & CEO', sigX, y + 17, { align: 'center' });

    // --- WATERMARK (circular stamp) ---
    doc.setDrawColor(235, 239, 250);
    doc.setTextColor(235, 239, 250);
    doc.setLineWidth(0.1);
    const wmX = W / 2, wmY = H / 2 - 10;
    doc.circle(wmX, wmY, 22, 'S');
    doc.circle(wmX, wmY, 24, 'S');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('INTERNMITRA TECHNOLOGIES', wmX, wmY - 4, { align: 'center' });
    doc.text('PRIVATE LIMITED', wmX, wmY + 2, { align: 'center' });

    // --- FOOTER LOGO BOXES ---
    const fY = H - 38;
    doc.setTextColor(40, 40, 40);
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.3);
    const logos = [
      { x: 13, lines: ['MINISTRY OF', 'CORPORATE', 'AFFAIRS'], sub: 'GOVERNMENT OF INDIA' },
      { x: 57, lines: ['MSME'], sub: 'Ministry of MSME, Govt. of India' },
      { x: 101, lines: ['ISO', '9001:2015'], sub: 'CERTIFIED' },
      { x: 145, lines: ['DPIIT'], sub: '' },
    ];
    logos.forEach(({ x, lines: lblLines, sub }) => {
      doc.rect(x, fY, 36, 22, 'S');
      const startLY = fY + 9 - (lblLines.length - 1) * 2;
      lblLines.forEach((line, i) => {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.text(line, x + 18, startLY + i * 4, { align: 'center' });
      });
      if (sub) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(5);
        doc.text(sub, x + 18, fY + 19, { align: 'center' });
      }
    });

    // --- BOTTOM BLUE STRIP ---
    doc.setFillColor(37, 99, 235);
    doc.rect(0, H - 12, W, 12, 'F');

    // Bottom-right decorative circle
    doc.setFillColor(59, 130, 246);
    doc.circle(W - 14, H - 26, 7, 'F');
    doc.setFillColor(37, 99, 235);
    doc.circle(W - 14, H - 26, 5, 'F');

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
