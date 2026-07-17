import { motion } from 'motion/react';
import { Handshake, Target, Users, Award, ShieldCheck, Zap } from 'lucide-react';

export default function About() {
  return (
    <div className="py-20 bg-[#f8fafc] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-4xl mx-auto mb-20 lg:mb-24 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 bg-blue-50 text-blue-600 border border-blue-100/60 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm hover:rotate-6 transition-transform cursor-pointer"
          >
            <Handshake size={28} />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-none"
          >
            Bridging the Gap Between <br className="hidden sm:inline"/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Education</span> and <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Industry</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-slate-500 font-semibold leading-relaxed max-w-3xl mx-auto"
          >
            InternMitra is a professional training ecosystem dedicated to empowering scholars with certified internship experiences and industry-approved skills.
          </motion.p>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
          <motion.div 
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="relative"
          >
             <div className="rounded-[2rem] overflow-hidden shadow-lg relative z-10 border border-slate-100 group">
               <img 
                 src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800" 
                 alt="Students collaborating" 
                 className="w-full h-[400px] md:h-[500px] object-cover transition-transform duration-700 group-hover:scale-103" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
             </div>
             <div className="absolute -top-10 -left-10 w-48 h-48 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />
             <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-600/5 rounded-full blur-[80px] pointer-events-none" />
          </motion.div>

          <div className="space-y-10">
            <div className="space-y-3">
              <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.25em] bg-blue-50 px-2.5 py-1 rounded inline-block">Our Core Mission</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Equipping Scholars for Success</h2>
              <p className="text-slate-500 leading-relaxed font-semibold text-sm sm:text-base">
                Our mission is to democratize high-quality industrial training by providing structured, certified <span className="text-slate-900 font-extrabold">120-hour internship programs</span> across 17+ high-growth domains.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {[
                 { title: 'Industry First', desc: 'Curated specialized curriculum.', icon: ShieldCheck },
                 { title: 'Hyper-Growth', desc: 'Live mentored ecosystem.', icon: Zap },
                 { title: 'Credibility', icon: Target, desc: 'UGC compliant certification.' },
                 { title: 'Scale & Reach', icon: Users, desc: 'Network of 20,000+ scholars.' }
               ].map((item) => (
                 <div key={item.title} className="flex gap-4 group bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm hover:border-blue-100 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50 flex items-center justify-center shrink-0 shadow-sm transition-colors group-hover:bg-blue-600 group-hover:text-white duration-300">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 leading-tight mb-1 tracking-tight text-sm uppercase">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 font-semibold leading-normal">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>

            {/* Support Alliance card */}
            <div className="p-8 bg-[#0c1329] rounded-[2rem] text-white relative overflow-hidden shadow-lg border border-slate-800 group">
               <div className="relative z-10 space-y-4">
                 <h3 className="text-lg font-black tracking-tight uppercase">Strategic Alliances</h3>
                 <p className="text-slate-400 font-semibold leading-relaxed text-xs sm:text-sm">
                   We collaborate with partner companies and industry representatives to ensure our scholars stay relevant in the evolving market.
                 </p>
                 <div className="flex -space-x-3 pt-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-9 h-9 rounded-full border-2 border-[#0c1329] bg-slate-850 shadow-md overflow-hidden">
                         <img src={`https://i.pravatar.cc/150?u=${i + 25}`} alt="Partner avatar" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div className="w-9 h-9 rounded-full border-2 border-[#0c1329] bg-blue-600 flex items-center justify-center text-white text-[8px] font-black uppercase shadow-md relative z-10">+500</div>
                 </div>
               </div>
               <div className="absolute top-0 right-0 p-6 transform group-hover:scale-105 transition-transform duration-500 pointer-events-none">
                  <Award size={120} className="text-blue-500/10 rotate-12" />
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
