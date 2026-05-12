import React, { useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { motion } from 'motion/react';
import { 
  PlayCircle, 
  FileText, 
  FileVideo, 
  Search,
  Filter,
  Download,
  BookOpenCheck,
  ChevronRight,
  MonitorPlay
} from 'lucide-react';

export default function LMS() {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const materials = [
    { title: 'Introduction to ' + profile?.internshipDomain, type: 'Video', duration: '45 mins', size: '250MB', icon: PlayCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Advanced Concepts & Best Practices', type: 'PPT', duration: '12 Slides', size: '15MB', icon: FileVideo, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Industry Project Case Studies', type: 'PDF', duration: '20 Pages', size: '4MB', icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Development Tools & Setup Guide', type: 'Video', duration: '30 mins', size: '120MB', icon: PlayCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Assessment Preparation Guide', type: 'PDF', duration: '5 Pages', size: '2MB', icon: FileText, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-4 uppercase italic">Learning / <span className="text-blue-600">LMS Archive</span></h1>
          <p className="text-xl text-slate-500 font-bold italic leading-relaxed">Access your curated library for <span className="text-slate-900 border-b-4 border-blue-50">{profile?.internshipDomain}</span>.</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="bg-blue-600 text-white p-5 px-10 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition uppercase tracking-widest text-xs">
             <MonitorPlay size={20} />
             Start Learning
           </button>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-grow group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={24} />
          <input 
            type="text" 
            placeholder="Search for videos, PPTs, or assignments..." 
            className="w-full h-16 pl-16 pr-6 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="h-16 px-10 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition">
          <Filter size={20} /> Filters
        </button>
      </div>

      {/* Featured Video Section */}
      <div className="bg-white p-10 lg:p-14 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-900/[0.02] overflow-hidden relative group">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-red-100 animate-pulse">
              <div className="w-2 h-2 bg-red-600 rounded-full" />
              Live Training Session
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-8 tracking-tighter leading-tight uppercase italic">Watch Daily <br/><span className="text-blue-600">Live Classes</span></h2>
            <p className="text-slate-500 font-bold italic mb-10 text-xl leading-relaxed max-w-lg">
              "Direct access to our YouTube live broadcast. Join the daily 4-hour immersive sessions with industry experts."
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <PlayCircle size={20} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-900 italic">4.5 Hours Daily</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <MonitorPlay size={20} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-900 italic">Interactive Chat</span>
              </div>
            </div>
          </div>
          
          <div className="aspect-video w-full bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative group-hover:scale-[1.02] transition-transform duration-700">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Example placeholder, user can swap
              title="InternMitra Live Training"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {materials.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-900/[0.02] flex flex-col group hover:shadow-2xl hover:border-blue-100 transition-all duration-500 relative overflow-hidden"
          >
            <div className={`w-16 h-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-10 border border-white shadow-md group-hover:rotate-12 transition-transform relative z-10`}>
              <item.icon size={32} />
            </div>
            <div className="flex-grow relative z-10">
              <div className="text-[10px] text-blue-600 font-black uppercase tracking-[0.3em] mb-3">{item.type} • <span className="text-slate-400">{item.size}</span></div>
              <h3 className="text-2xl font-black text-slate-900 mb-6 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tighter">{item.title}</h3>
              <p className="text-slate-500 italic font-bold mb-10 text-sm">Session Duration: {item.duration}</p>
            </div>
            <div className="pt-8 border-t border-slate-50 flex items-center justify-between relative z-10">
               <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition underline underline-offset-8">
                 <Download size={14} /> Download Asset
               </button>
               <button className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-inner group/btn">
                 <ChevronRight size={24} className="group-hover/btn:translate-x-0.5 transition-transform" />
               </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 -z-0" />
          </motion.div>
        ))}

        {/* Feature Teaser Card */}
        <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col justify-between shadow-2xl shadow-slate-900/40 overflow-hidden relative group">
           <div className="relative z-10">
             <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
               <BookOpenCheck size={36} />
             </div>
             <h3 className="text-3xl font-black mb-6 tracking-tighter leading-tight italic uppercase">Live Training <br/>Archive</h3>
             <p className="text-slate-400 font-bold leading-relaxed italic mb-10 text-sm">Access all past 4-hour daily sessions for reference.</p>
             <button className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition shadow-xl">Watch Recordings</button>
           </div>
           
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full group-hover:scale-150 transition-all duration-700" />
        </div>
      </div>
    </div>

  );
}
