import { motion } from 'motion/react';
import { INTERNSHIP_DOMAINS } from '../lib/constants';
import { CheckCircle2, GraduationCap, LayoutDashboard, FileText, Users, Headset } from 'lucide-react';

export default function Features() {
  const coreFeatures = [
    {
      title: 'LMS (Learning Management System)',
      desc: 'Access video lectures, PPTs, and interactive study materials for 17 specialized subjects.',
      icon: LayoutDashboard
    },
    {
      title: 'Live Training Sessions',
      desc: '120 hours of interactive training (4 hours daily for 30 days) with industry veterans.',
      icon: GraduationCap
    },
    {
      title: 'Real-time Progress Tracking',
      desc: 'Visual progress bars to monitor your learning journey and internship status.',
      icon: CheckCircle2
    },
    {
      title: 'Direct Faculty Access',
      desc: 'Instant doubt resolution via our Live Q&A engine and dedicated expert mentors.',
      icon: Headset
    },
    {
      title: 'Career Support Tools',
      desc: '1:1 mentor support for resume building and interview preparation with 10+ partner companies.',
      icon: Users
    },
    {
      title: 'Automated Documentation',
      desc: 'Instant download of UGC-compliant certificates, marksheets, and attendance records.',
      icon: FileText
    }
  ];

  return (
    <div className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-24 lg:mb-40">
           <h3 className="text-[10px] text-blue-600 font-black uppercase tracking-[0.4em] mb-6 italic border-l-4 border-blue-600 pl-6 inline-block">The Infrastructure</h3>
           <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-7xl font-black text-slate-900 mb-10 tracking-tighter uppercase italic leading-[1.05]"
          >
            Sovereign Architecture <br/> <span className="text-blue-600">for Modern Interns.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl text-slate-500 leading-relaxed italic font-bold max-w-3xl mx-auto"
          >
            InternMitra provides a premium suite of tools designed to transform your academic baseline into professional superiority.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-40">
          {coreFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-900/[0.02] hover:shadow-2xl hover:border-blue-100 transition-all duration-700 relative group overflow-hidden"
            >
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-10 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-12 transition-all duration-500 shadow-xl shadow-blue-600/5">
                <feature.icon size={36} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-5 tracking-tighter uppercase italic leading-tight">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed text-lg font-bold italic">{feature.desc}</p>
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-12 -translate-y-12 -z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-[4rem] p-12 lg:p-24 border border-slate-100 shadow-2xl shadow-slate-900/[0.02] relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-10">
               <div className="max-w-2xl">
                 <h3 className="text-[10px] text-blue-600 font-black uppercase tracking-[0.4em] mb-4 italic">Technical Ecosystem</h3>
                 <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Specialized <br/> Industry Nodes.</h2>
               </div>
               <p className="text-xl text-slate-400 font-bold italic max-w-sm">Choose from our massive registry of 17+ industrial specializations curated for global dominance.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {INTERNSHIP_DOMAINS.map((domain, i) => (
                <motion.div
                  key={domain}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (i % 4) * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-5 p-6 rounded-3xl bg-slate-50 border border-slate-100 group/item hover:bg-blue-600 hover:border-blue-600 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-blue-600/20"
                >
                  <div className="w-3 h-3 rounded-full bg-blue-600 group-hover/item:bg-white shrink-0 shadow-xl" />
                  <span className="text-slate-900 font-black uppercase italic tracking-tighter text-sm group-hover/item:text-white transition-colors">{domain}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] -translate-y-1/2 translate-x-1/2 rounded-full" />
        </div>
      </div>
    </div>

  );
}
