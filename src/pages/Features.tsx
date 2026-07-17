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
    <div className="py-20 bg-[#f8fafc] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-4xl mx-auto mb-20 lg:mb-24 space-y-6">
           <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.25em] bg-blue-50 px-2.5 py-1 rounded inline-block">Ecosystem Architecture</span>
           <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-none"
          >
            Sovereign Tools for <br className="hidden sm:inline"/> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Modern Interns</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-slate-500 font-semibold leading-relaxed max-w-2xl mx-auto"
          >
            InternMitra provides a premium suite of tools designed to transform your academic baseline into professional superiority.
          </motion.p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {coreFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className="bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-100 shadow-soft hover:shadow-elegant hover:border-blue-100/50 transition-all duration-300 relative group overflow-hidden"
            >
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-all duration-300 shadow-sm border border-blue-100/20">
                <feature.icon size={22} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-3 tracking-tight uppercase leading-tight">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm font-semibold">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Technical domains container */}
        <div className="bg-white rounded-[2rem] p-8 lg:p-16 border border-slate-100 shadow-soft relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
               <div className="max-w-2xl space-y-3">
                 <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.25em] bg-blue-50 px-2.5 py-1 rounded inline-block">Technical Modules</span>
                 <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight uppercase leading-none">Specialized <br className="hidden sm:inline"/> Industry Nodes</h2>
               </div>
               <p className="text-slate-400 font-semibold text-sm max-w-sm">Choose from our massive registry of 17+ industrial specializations curated for global dominance.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {INTERNSHIP_DOMAINS.map((domain, i) => (
                <motion.div
                  key={domain}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (i % 4) * 0.03 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-100 group/item hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:border-blue-600 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-600 group-hover/item:bg-white shrink-0 shadow-sm" />
                  <span className="text-slate-900 font-extrabold uppercase tracking-tight text-[11px] group-hover/item:text-white transition-colors">{domain}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/5 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
