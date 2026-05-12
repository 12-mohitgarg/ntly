import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, MessageSquare, ArrowRight, Send, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function Contact() {
  return (
    <div className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-24">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl lg:text-7xl font-black text-slate-900 mb-8 tracking-tighter uppercase italic leading-none"
          >
            Get in <span className="text-blue-600">Touch</span> / <span className="text-blue-600">Support</span>.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl text-slate-500 font-bold italic leading-relaxed"
          >
            "Have questions about our internship programs or technical tracks? Our industry experts are here to help."
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Info Side */}
          <div className="lg:col-span-2 space-y-8">
             {[
               { title: 'Primary Communication', val: 'contact@internmitra.in', icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50' },
               { title: 'Voice Frequency', val: '+91 98765 43210', icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50' },
               { title: 'Physical Node', val: 'New Delhi, India', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
             ].map((item, i) => (
               <motion.div
                 key={item.title}
                 initial={{ opacity: 0, x: -30 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-900/[0.02] flex items-center gap-8 group hover:shadow-2xl hover:border-blue-100 transition-all duration-500"
               >
                 <div className={`w-16 h-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center border border-white shadow-xl group-hover:rotate-12 transition-transform`}>
                   <item.icon size={28} />
                 </div>
                 <div>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-2 leading-none italic">{item.title}</p>
                   <p className="text-xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">{item.val}</p>
                 </div>
               </motion.div>
             ))}

             <div className="p-12 bg-slate-900 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl shadow-slate-900/40 group">
                <div className="relative z-10">
                   <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-10 shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
                     <HelpCircle size={32} className="text-white" />
                   </div>
                   <h3 className="text-3xl font-black mb-6 tracking-tighter uppercase italic leading-none">Knowledge Hub</h3>
                   <p className="text-slate-400 italic mb-10 leading-relaxed font-bold text-lg">Check our real-time FAQ database for instant answers to technical and enrollment queries.</p>
                   <button className="flex items-center gap-3 font-black text-blue-400 text-xs uppercase tracking-widest hover:text-white transition group">
                     Explore Repository <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                   </button>
                </div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[100px] translate-x-12 -translate-y-12" />
             </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-3">
             <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white p-10 lg:p-20 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-900/[0.02] h-full relative overflow-hidden"
             >
                <div className="mb-14 relative z-10">
                   <h3 className="text-[10px] text-blue-600 font-black uppercase tracking-[0.4em] mb-4 italic border-l-4 border-blue-600 pl-5">Communication Portal</h3>
                   <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight mb-6 uppercase italic">Propagate a <br/>Query Engine.</h2>
                   <p className="text-slate-400 italic font-bold text-lg leading-relaxed">Fields marked with <span className="text-blue-600 font-black">*</span> are required for priority processing.</p>
                </div>

                <form className="space-y-10 relative z-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <Label className="uppercase tracking-[0.3em] text-[10px] font-black text-slate-400 px-2 italic">Full Identity *</Label>
                        <Input placeholder="Enter your full name" className="h-20 rounded-[1.5rem] bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-slate-900 text-lg shadow-inner" />
                      </div>
                      <div className="space-y-4">
                        <Label className="uppercase tracking-[0.3em] text-[10px] font-black text-slate-400 px-2 italic">Transmission Axis *</Label>
                        <Input placeholder="name@domain.com" className="h-20 rounded-[1.5rem] bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-slate-900 text-lg shadow-inner" />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <Label className="uppercase tracking-[0.3em] text-[10px] font-black text-slate-400 px-2 italic">Reason Of Engagement</Label>
                      <select className="w-full h-20 rounded-[1.5rem] bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 px-8 transition-all font-bold text-slate-900 text-lg shadow-inner appearance-none">
                        <option>Program Enrollment</option>
                        <option>Technical Track Query</option>
                        <option>Strategic Partnership</option>
                        <option>Certification Verification</option>
                        <option>Infrastructure Support</option>
                      </select>
                   </div>

                   <div className="space-y-4">
                      <Label className="uppercase tracking-[0.3em] text-[10px] font-black text-slate-400 px-2 italic">Query Payload *</Label>
                      <textarea 
                        rows={5} 
                        placeholder="How can we synchronize today?" 
                        className="w-full p-8 bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 rounded-[2rem] transition-all font-bold text-slate-900 text-lg resize-none shadow-inner"
                      />
                   </div>

                   <Button className="h-20 w-full lg:w-auto px-16 bg-blue-600 hover:bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 flex items-center justify-center gap-4 group transition-all duration-500 hover:scale-[1.02]">
                      Submit Engagement 
                      <Send size={24} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
                   </Button>
                </form>
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 -z-0" />
             </motion.div>
          </div>
        </div>
      </div>
    </div>

  );
}
