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
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-4 uppercase italic">Credentials / <span className="text-blue-600">Verification</span></h1>
          <p className="text-xl text-slate-500 font-bold italic leading-relaxed max-w-2xl">"Official industry-recognized documentation automatically generated upon completion of requirements."</p>
        </div>
        <div className="p-6 px-8 bg-blue-50 text-blue-600 rounded-[2rem] border border-blue-100 flex items-center gap-4 shadow-xl shadow-blue-600/5 relative overflow-hidden group">
          <ShieldCheck size={32} className="relative z-10" />
          <span className="text-xs font-black uppercase tracking-[0.2em] leading-tight relative z-10">UGC Optimized <br />Platform</span>
          <div className="absolute top-0 right-0 w-12 h-12 bg-blue-600/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform" />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {docs.map((doc, i) => (
          <motion.div
            key={doc.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-10 rounded-[3.5rem] border shadow-2xl shadow-slate-900/[0.02] transition-all duration-500 flex flex-col justify-between group relative overflow-hidden ${doc.ready ? 'bg-white border-slate-100 hover:shadow-2xl hover:border-blue-100' : 'bg-slate-50 border-slate-100 opacity-60 grayscale-[0.5]'}`}
          >
            <div>
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-10 border border-white shadow-xl transition-transform group-hover:scale-110 relative z-10 ${doc.ready ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                <doc.icon size={36} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tighter uppercase italic leading-none">{doc.name}</h3>
              <p className="text-slate-500 font-bold italic mb-12 leading-relaxed text-lg">{doc.desc}</p>
            </div>

            {doc.ready ? (
              <button
                onClick={() => generatePDF(doc.type)}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all duration-500 shadow-xl flex items-center justify-center gap-3 group/btn relative z-10"
              >
                <Download size={20} className="group-hover/btn:translate-y-1 transition-transform" />
                Download PDF
              </button>
            ) : (
              <div className="flex items-center gap-3 text-slate-400 font-black italic text-xs uppercase tracking-widest relative z-10">
                <div className="w-2 h-2 bg-slate-300 rounded-full" />
                Locked: Requires Completion
              </div>
            )}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 -z-0" />
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900 p-12 lg:p-16 rounded-[4rem] mt-16 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40 group">
        <div className="relative z-10 max-w-2xl">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-10 shadow-xl shadow-blue-600/20 group-hover:rotate-12 transition-transform">
            <Award size={32} />
          </div>
          <h2 className="text-4xl font-black mb-8 tracking-tighter uppercase italic">Need Physical <br />Artifacts?</h2>
          <p className="text-slate-400 text-xl mb-12 leading-relaxed italic font-bold">"Verified physical certificates signed by industry representatives can be requested post-successful completion. Global courier tracking included."</p>
          <button className="px-12 py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-2xl">Request Physical Hardcopy</button>
        </div>
        <Award size={300} className="absolute -right-20 -bottom-20 text-blue-600/10 opacity-40 rotate-[15deg] group-hover:rotate-[25deg] transition-transform duration-1000" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
      </div>
    </div>

  );
}
