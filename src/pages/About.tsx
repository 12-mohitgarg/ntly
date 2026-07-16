import React from 'react';
import { motion } from 'motion/react';
import { Handshake, Target, Users, Award, ShieldCheck, Zap } from 'lucide-react';

export default function About() {
  return (
    <div className="py-24 bg-[#fafbfc] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-20 lg:mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-18 h-18 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm hover:rotate-6 transition-transform"
          >
            <Handshake size={32} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 mb-8 tracking-tighter uppercase leading-none"
          >
            Bridging the Gap Between <span className="gradient-text">Education</span> and <span className="gradient-text">Industry</span>.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl sm:text-2xl text-slate-500 font-semibold italic leading-relaxed"
          >
            InternMitra is a professional training ecosystem dedicated to empowering scholars with certified internship experiences and industry-approved skills.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-32">
          <motion.div 
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="relative"
          >
             <div className="rounded-[2.5rem] overflow-hidden shadow-md relative z-10 border border-slate-100 group">
               <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800" alt="Students collaborating" className="w-full h-[450px] md:h-[550px] object-cover transition-transform duration-700 group-hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
             </div>
             <div className="absolute -top-10 -left-10 w-48 h-48 bg-indigo-600/5 rounded-full blur-[80px] pointer-events-none" />
             <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-violet-600/5 rounded-full blur-[80px] pointer-events-none" />
          </motion.div>

          <div className="space-y-12">
            <div>
              <span className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.25em] bg-indigo-50 px-2.5 py-1 rounded inline-block mb-3">Our Core Mission</span>
              <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight uppercase">Equipping Scholars</h2>
              <p className="text-base sm:text-lg text-slate-500 leading-relaxed font-semibold italic">Our mission is to democratize high-quality industrial training by providing structured, certified <span className="text-slate-900 font-black">120-hour internship programs</span> across 17+ high-growth domains.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
               {[
                 { title: 'Industry First', desc: 'Curated specialized curriculum.', icon: ShieldCheck },
                 { title: 'Hyper-Growth', desc: 'Live Q&A mentored ecosystem.', icon: Zap },
                 { title: 'Credibility', icon: Target, desc: 'UGC compliant certification.' },
                 { title: 'Scale & Reach', icon: Users, desc: 'Network of 20,000+ scholars.' }
               ].map((item, i) => (
                 <div key={item.title} className="flex gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 shadow-sm transition-colors group-hover:bg-indigo-600 group-hover:text-white duration-300">
                      <item.icon size={22} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 leading-tight mb-1 uppercase tracking-tight text-base">{item.title}</h4>
                      <p className="text-xs text-slate-400 font-semibold leading-relaxed">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-8 md:p-10 bg-slate-950 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl border border-slate-800 group">
               <div className="relative z-10">
                 <h3 className="text-xl font-black mb-4 tracking-tight uppercase">Strategic Alliances</h3>
                 <p className="text-slate-400 font-semibold italic mb-8 leading-relaxed text-sm md:text-base">We collaborate with over 10+ partner companies and industry representatives to ensure our scholars stay relevant in the evolving market.</p>
                 <div className="flex -space-x-4">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 shadow-md overflow-hidden transition-all opacity-80 hover:opacity-100 duration-300 hover:z-20 hover:scale-105">
                         <img src={`https://i.pravatar.cc/150?u=${i+20}`} alt="Partner avatar" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-slate-950 bg-indigo-600 flex items-center justify-center text-white text-[9px] font-black uppercase shadow-md relative z-20">+500</div>
                 </div>
               </div>
               <div className="absolute top-0 right-0 p-8 transform group-hover:scale-105 transition-transform duration-500 pointer-events-none">
                  <Award size={150} className="text-indigo-500/10 rotate-12" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
