import { motion } from 'motion/react';
import { Mail, Phone, MapPin, HelpCircle, ArrowRight, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function Contact() {
  return (
    <div className="py-20 bg-[#f8fafc] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-4xl mx-auto mb-20 lg:mb-24 space-y-6">
           <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.25em] bg-blue-50 px-2.5 py-1 rounded inline-block">Support Desk</span>
           <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-none"
          >
            Get in <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Touch</span> with Us
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-slate-500 font-semibold leading-relaxed max-w-2xl mx-auto"
          >
            Have questions about our internship programs or technical tracks? Our industry experts are here to help.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-stretch">
          {/* Info Side */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {[
              { title: 'Email Communication', val: 'info@internmitra.com', icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100/50' },
              { title: 'Support Helpline', val: '+91 9693921517', icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100/50' },
              { title: 'Main Office', val: 'Patna, Bihar, India', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100/50' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-soft flex items-center gap-6 group hover:shadow-elegant hover:border-blue-100/50 transition-all duration-300"
              >
                <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center border group-hover:rotate-6 transition-transform shadow-sm`}>
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1 leading-none">{item.title}</p>
                  <p className="text-base font-extrabold text-slate-900 tracking-tight leading-normal">{item.val}</p>
                </div>
              </motion.div>
            ))}

            <div className="p-8 bg-[#0c1329] rounded-[2rem] text-white relative overflow-hidden shadow-lg border border-slate-800 group mt-auto">
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                  <HelpCircle size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-black tracking-tight uppercase">Knowledge Hub</h3>
                <p className="text-slate-400 font-semibold leading-relaxed text-xs">Check our real-time FAQ database for instant answers to technical and enrollment queries.</p>
                <button className="flex items-center gap-2 font-black text-blue-400 text-xs uppercase tracking-widest hover:text-white transition group cursor-pointer">
                  Explore Repository <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[100px] translate-x-12 -translate-y-12 pointer-events-none" />
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 lg:p-12 rounded-[2rem] border border-slate-100 shadow-soft h-full flex flex-col justify-between"
            >
              <div className="mb-8">
                <span className="text-[9px] text-blue-600 font-black uppercase tracking-[0.25em] mb-2.5 inline-block bg-blue-50 px-2.5 py-1 rounded">Support Axis</span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase">Submit Query</h2>
                <p className="text-slate-400 font-semibold text-xs mt-1">Fields marked with <span className="text-blue-600 font-black">*</span> are required for priority processing.</p>
              </div>

              <form className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="uppercase tracking-[0.2em] text-[9px] font-black text-slate-400 px-1">Full Name *</Label>
                    <Input placeholder="Enter your full name" className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-slate-800 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="uppercase tracking-[0.2em] text-[9px] font-black text-slate-400 px-1">Email Address *</Label>
                    <Input placeholder="name@domain.com" className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-slate-800 text-sm" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="uppercase tracking-[0.2em] text-[9px] font-black text-slate-400 px-1">Reason Of Engagement</Label>
                  <select className="w-full h-12 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 px-4 transition-all font-semibold text-slate-800 text-sm appearance-none shadow-sm cursor-pointer">
                    <option>Program Enrollment</option>
                    <option>Technical Track Query</option>
                    <option>Strategic Partnership</option>
                    <option>Certification Verification</option>
                    <option>Infrastructure Support</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="uppercase tracking-[0.2em] text-[9px] font-black text-slate-400 px-1">Message *</Label>
                  <textarea
                    rows={4}
                    placeholder="How can we support you today?"
                    className="w-full p-4 bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all font-semibold text-slate-800 text-sm resize-none shadow-inner"
                  />
                </div>

                <Button className="h-12 w-full sm:w-auto px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2 group transition-all duration-300 hover:scale-[1.01]">
                  Send Message
                  <Send size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
