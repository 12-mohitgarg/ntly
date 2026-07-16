import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, MessageSquare, ArrowRight, Send, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function Contact() {
  return (
    <div className="py-24 bg-[#fafbfc] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-20 lg:mb-32">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl lg:text-7xl font-black text-slate-900 mb-8 tracking-tighter uppercase leading-none"
          >
            Get in <span className="gradient-text">Touch</span> / Support.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-2xl text-slate-500 font-semibold italic leading-relaxed"
          >
            "Have questions about our internship programs or technical tracks? Our industry experts are here to help."
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Info Side */}
          <div className="lg:col-span-2 space-y-6">
            {[
              { title: 'Primary Communication', val: 'info@internmitra.com', icon: Mail, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
              { title: 'Voice Frequency', val: '9693921517', icon: Phone, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
              { title: 'Physical Node', val: 'Patna, Bihar, India', icon: MapPin, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md hover:border-indigo-100/50 transition-all duration-300"
              >
                <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center border group-hover:rotate-6 transition-transform shadow-inner`}>
                  <item.icon size={24} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.25em] mb-1.5 leading-none">{item.title}</p>
                  <p className="text-lg font-black text-slate-900 tracking-tight leading-none">{item.val}</p>
                </div>
              </motion.div>
            ))}

            <div className="p-10 bg-slate-950 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl group border border-slate-800">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                  <HelpCircle size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase italic leading-none">Knowledge Hub</h3>
                <p className="text-slate-400 italic mb-8 leading-relaxed font-bold text-base">Check our real-time FAQ database for instant answers to technical and enrollment queries.</p>
                <button className="flex items-center gap-2 font-black text-indigo-400 text-xs uppercase tracking-widest hover:text-white transition group">
                  Explore Repository <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-[100px] translate-x-12 -translate-y-12 pointer-events-none" />
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 lg:p-14 rounded-[2.5rem] border border-slate-100 shadow-sm h-full relative overflow-hidden"
            >
              <div className="mb-10 relative z-10">
                <span className="text-[9px] text-indigo-600 font-black uppercase tracking-[0.3em] mb-3 inline-block bg-indigo-50 px-2.5 py-1 rounded">Communication Portal</span>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-4 uppercase">Submit Query Payload</h2>
                <p className="text-slate-400 font-semibold text-sm leading-relaxed">Fields marked with <span className="text-indigo-600 font-black">*</span> are required for priority processing.</p>
              </div>

              <form className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="uppercase tracking-[0.2em] text-[10px] font-black text-slate-500 px-1">Full Identity *</Label>
                    <Input placeholder="Enter your full name" className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all font-semibold text-slate-900 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase tracking-[0.2em] text-[10px] font-black text-slate-500 px-1">Transmission Axis *</Label>
                    <Input placeholder="name@domain.com" className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all font-semibold text-slate-900 text-base" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="uppercase tracking-[0.2em] text-[10px] font-black text-slate-500 px-1">Reason Of Engagement</Label>
                  <select className="w-full h-14 rounded-2xl bg-slate-50 border-transparent border focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 px-5 transition-all font-semibold text-slate-900 text-base appearance-none shadow-sm">
                    <option>Program Enrollment</option>
                    <option>Technical Track Query</option>
                    <option>Strategic Partnership</option>
                    <option>Certification Verification</option>
                    <option>Infrastructure Support</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="uppercase tracking-[0.2em] text-[10px] font-black text-slate-500 px-1">Query Payload *</Label>
                  <textarea
                    rows={4}
                    placeholder="How can we synchronize today?"
                    className="w-full p-5 bg-slate-50 border border-slate-200/40 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 rounded-2xl transition-all font-semibold text-slate-900 text-base resize-none shadow-sm"
                  />
                </div>

                <Button className="h-14 w-full lg:w-auto px-10 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-3 group transition-all duration-300 hover:scale-[1.01]">
                  Submit Engagement
                  <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>

  );
}
