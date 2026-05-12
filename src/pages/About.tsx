import React from 'react';
import { motion } from 'motion/react';
import { Handshake, Target, Users, Award, ShieldCheck, Zap } from 'lucide-react';

export default function About() {
  return (
    <div className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-24 lg:mb-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 shadow-xl shadow-blue-600/5 transition-transform hover:rotate-12"
          >
            <Handshake size={44} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-7xl font-black text-slate-900 mb-10 tracking-tighter leading-[1.1] uppercase italic"
          >
            Bridging the Gap Between <span className="text-blue-600">Education</span> and <span className="text-blue-600">Industry</span>.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl text-slate-500 leading-relaxed italic font-bold max-w-3xl mx-auto"
          >
            INTERNMITRA is a premium educational platform dedicated to empowering students with certified internship programs and industry-recognized skill sets.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-40">
          <motion.div 
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="relative"
          >
             <div className="rounded-[4rem] overflow-hidden shadow-2xl relative z-10 border-8 border-slate-50 group">
               <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800" alt="Students collaborating" className="w-full h-[650px] object-cover transition-transform duration-1000 group-hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
             </div>
             <div className="absolute -top-12 -left-12 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] animate-pulse" />
             <div className="absolute -bottom-12 -right-12 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] animate-pulse delay-700" />
          </motion.div>

          <div className="space-y-16">
            <div>
              <h3 className="text-[10px] text-blue-600 font-black uppercase tracking-[0.4em] mb-4 italic">The Architecture</h3>
              <h2 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter uppercase italic leading-tight">Our Core Mission</h2>
              <p className="text-xl text-slate-500 leading-relaxed italic font-bold">Our mission is to democratize high-quality industrial training by providing accessible, structured, and certified <span className="text-slate-900">120-hour internship programs</span> across 17+ domains.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
               {[
                 { title: 'Industry First', desc: 'Curated specialized curriculum.', icon: ShieldCheck },
                 { title: 'Hyper-Growth', desc: 'Live Q&A mentored ecosystem.', icon: Zap },
                 { title: 'Credibility', icon: Target, desc: 'UGC compliant certification.' },
                 { title: 'Scale', icon: Users, desc: 'Network of 50,000+ scholars.' }
               ].map((item, i) => (
                 <div key={item.title} className="flex gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-xl shadow-blue-600/5 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                      <item.icon size={26} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 leading-tight mb-2 uppercase italic tracking-tighter text-lg">{item.title}</h4>
                      <p className="text-sm text-slate-400 font-bold italic leading-relaxed">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-12 bg-slate-900 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl shadow-slate-900/20 group">
               <div className="relative z-10">
                 <h3 className="text-2xl font-black mb-6 tracking-tighter uppercase italic">Strategic Alliances</h3>
                 <p className="text-slate-400 font-bold italic mb-8 leading-relaxed text-lg">We collaborate with over 10+ partner companies and industry representatives to ensure our scholars stay relevant in the evolving market.</p>
                 <div className="flex -space-x-6">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-14 h-14 rounded-full border-4 border-slate-900 bg-slate-800 shadow-xl overflow-hidden grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100 transition-all duration-500 hover:z-20">
                         <img src={`https://i.pravatar.cc/150?u=${i+20}`} alt="Partner" />
                      </div>
                    ))}
                    <div className="w-14 h-14 rounded-full border-4 border-slate-900 bg-blue-600 flex items-center justify-center text-white text-[10px] font-black uppercase shadow-xl relative z-20">+500</div>
                 </div>
               </div>
               <div className="absolute top-0 right-0 p-8 transform group-hover:scale-110 transition-transform duration-1000">
                  <Award size={200} className="text-blue-600/10 rotate-12" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
