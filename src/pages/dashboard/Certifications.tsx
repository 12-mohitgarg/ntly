import React from 'react';
import { useAuth } from '../../components/AuthContext';
import { motion } from 'motion/react';
import {
  Download,
  Award,
  FileCheck,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { generateCertificate } from './generateCertificate';
import { generateAttendanceReport } from './generateAttendanceReport';

export default function Certifications() {
  const { profile, user } = useAuth();

  const generatePDF = async (type: string) => {
    if (type === 'certificate') {
      if (!user?.uid) {
        alert('User session not found');
        return;
      }
      try {
        await generateCertificate(profile, user.uid);
      } catch (error) {
        console.error(error);
        alert('Error downloading certificate');
      }
    } else if (type === 'attendance') {
      try {
        await generateAttendanceReport(profile, [], []);
      } catch (error) {
        console.error(error);
        alert('Error downloading attendance report');
      }
    }
  };

  const docs = [
    { name: 'Internship Certificate', desc: 'UGC-Compliant Industry recognized digital certificate (PDF).', icon: Award, type: 'certificate', ready: (profile?.progress || 0) >= 100 },
    { name: 'Graded Marksheet', desc: 'Detailed breakdown of percentage, module scores, and final grading.', icon: FileCheck, type: 'marksheet', ready: (profile?.progress || 0) >= 100 },
    { name: 'Internship Report', desc: 'Structured report documenting your experience and skills acquired.', icon: FileText, type: 'report', ready: (profile?.progress || 0) >= 90 },
    { name: 'Attendance Record', desc: 'Official proof of participation in 30 days of live sessions.', icon: Clock, type: 'attendance', ready: true },
  ];

  return (
    <div className="student-page">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-3">
          <span className="student-kicker">Verification</span>
          <h1 className="student-title">
            Credentials / <span className="gradient-text">Verification</span>
          </h1>
          <p className="student-subtitle">Official industry-recognized documentation automatically generated upon completion of requirements.</p>
        </div>
        <div className="student-card p-5 px-6 flex items-center gap-4 relative overflow-hidden group min-w-[200px]">
          <ShieldCheck size={28} className="text-indigo-600 relative z-10" />
          <span className="text-[10px] font-black uppercase tracking-[0.18em] leading-tight relative z-10 text-slate-700">UGC Optimized <br />Platform</span>
          <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-600/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform" />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {docs.map((doc, i) => (
          <motion.div
            key={doc.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`student-card p-8 flex flex-col justify-between group relative overflow-hidden ${doc.ready ? 'border-slate-100 hover:border-indigo-500/20' : 'opacity-55 scale-[0.98] blur-[0.5px] cursor-not-allowed border-slate-200/40 bg-slate-50/50'}`}
          >
            <div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-white shadow-md transition-transform group-hover:scale-105 relative z-10 ${doc.ready ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                <doc.icon size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 uppercase italic leading-tight">{doc.name}</h3>
              <p className="text-slate-500 font-semibold italic mb-8 leading-relaxed text-sm">{doc.desc}</p>
            </div>

            {doc.ready ? (
              <button
                onClick={() => generatePDF(doc.type)}
                className="student-button-primary w-full h-11 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group/btn relative z-10"
              >
                <Download size={16} className="group-hover/btn:translate-y-0.5 transition-transform" />
                Download PDF
              </button>
            ) : (
              <div className="flex items-center gap-2.5 text-slate-400 font-black italic text-[10px] uppercase tracking-widest relative z-10">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                Locked: Requires Completion
              </div>
            )}
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 -z-0" />
          </motion.div>
        ))}
      </div>

      <div className="student-panel p-8 sm:p-10 lg:p-12 mt-12 text-white relative overflow-hidden group">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
            <Award size={24} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-tight">Need Physical <br />Artifacts?</h2>
          <p className="text-slate-300 text-base leading-relaxed italic font-semibold">Verified physical certificates signed by industry representatives can be requested post-successful completion. Global courier tracking included.</p>
          <button className="student-button-primary bg-white text-slate-900 border border-slate-100 hover:bg-slate-50 min-h-[44px] text-[10px] px-8">Request Physical Hardcopy</button>
        </div>
        <Award size={200} className="absolute -right-10 -bottom-10 text-indigo-500/10 opacity-40 rotate-[15deg] group-hover:rotate-[25deg] transition-transform duration-1000" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-600/5 blur-[80px] rounded-full pointer-events-none" />
      </div>
    </div>
  );
}
