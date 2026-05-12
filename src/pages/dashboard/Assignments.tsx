import React, { useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { motion } from 'motion/react';
import { 
  FileCheck, 
  Upload, 
  ExternalLink, 
  Clock,
  LayoutGrid,
  Trophy,
  AlertCircle
} from 'lucide-react';

export default function Assignments() {
  const { profile } = useAuth();

  const mockAssignments = [
    { id: 1, title: 'Foundational Theory Quiz', deadline: 'Oct 20', status: 'Graded', score: '95/100', domain: profile?.internshipDomain },
    { id: 2, title: 'Practical Lab 1: Environment Setup', deadline: 'Oct 25', status: 'Graded', score: '88/100', domain: profile?.internshipDomain },
    { id: 3, title: 'Live Project: Module 1 Delivery', deadline: 'Nov 02', status: 'Submitted', score: '-', domain: profile?.internshipDomain },
    { id: 4, title: 'Final Capstone Presentation', deadline: 'Nov 15', status: 'Pending', score: '-', domain: profile?.internshipDomain },
  ];

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-4 uppercase italic">Projects / <span className="text-blue-600">Assigned Tasks</span></h1>
           <p className="text-xl text-slate-500 font-bold italic leading-relaxed max-w-2xl">"Practical tasks simulating real-world work environments. Your performance here dictates your final certification grade."</p>
        </div>
        <div className="flex items-center gap-6 bg-white p-6 px-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5 relative overflow-hidden group">
           <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner relative z-10">
             <Trophy size={28} />
           </div>
           <div className="relative z-10">
             <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none mb-2">Overall Stance</div>
             <div className="text-2xl font-black text-slate-900 tracking-tighter italic">First Class <span className="text-blue-600">(A+)</span></div>
           </div>
           <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Active Submissions */}
        <div className="lg:col-span-2 space-y-10">
          <div className="flex items-center justify-between">
             <h3 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-4 uppercase italic">
               <LayoutGrid className="text-blue-600" size={32} />
               Current Pipeline
             </h3>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">{mockAssignments.length} Benchmarked Tasks</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {mockAssignments.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/[0.02] hover:shadow-2xl hover:border-blue-100 transition-all duration-500 group flex flex-col md:flex-row md:items-center gap-8 relative overflow-hidden"
              >
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg relative z-10 transition-transform group-hover:-rotate-6 ${task.status === 'Graded' ? 'bg-emerald-50 text-emerald-600' : task.status === 'Submitted' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                   {task.status === 'Graded' ? <FileCheck size={32} /> : <Clock size={32} />}
                </div>
                
                <div className="flex-grow relative z-10">
                   <div className="flex items-center gap-3 mb-3">
                     <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] bg-blue-50/50 px-3 py-1 rounded-lg italic">{task.domain}</span>
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">ETA: {task.deadline}</span>
                   </div>
                   <h4 className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors uppercase leading-none">{task.title}</h4>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 border-l border-slate-50 pl-8 shrink-0 relative z-10">
                   <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg border italic ${task.status === 'Graded' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : task.status === 'Submitted' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                     {task.status}
                   </div>
                   <div className="text-3xl font-black text-slate-900 italic tracking-tighter">{task.score}</div>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 translate-y-1/2 -z-0" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Upload Terminal */}
        <div className="space-y-8">
           <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Deployment</h3>
           <div className="bg-slate-900 p-10 lg:p-12 rounded-[3.5rem] text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
              <div className="relative z-10 text-center">
                 <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-blue-600/40 group-hover:scale-110 transition-transform">
                   <Upload size={36} />
                 </div>
                 <h4 className="text-2xl font-black mb-4 tracking-tighter uppercase italic">Ready to Push?</h4>
                 <p className="text-slate-400 text-sm font-bold italic mb-12 mx-auto max-w-[240px] leading-relaxed">Commit your project ZIP or share your production repository link below for review.</p>
                 
                 <div className="space-y-5 mb-10 text-left">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Repository URL</label>
                       <input type="text" placeholder="https://github.com/..." className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-white placeholder:text-slate-600" />
                    </div>
                    <button className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-xl">Hand Over Project</button>
                 </div>

                 <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] italic">
                   <AlertCircle size={14} className="text-blue-600" />
                   Max Size: 25MB ARCHIVE
                 </div>
              </div>
              <div className="absolute top-0 left-0 w-48 h-48 bg-blue-600/10 blur-[60px] rounded-full -translate-x-1/2 -translate-y-1/2" />
           </div>
           
           <div className="bg-white p-8 rounded-3xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-blue-100 hover:shadow-xl transition-all duration-500">
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-colors shadow-inner">
                    <ExternalLink size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                 </div>
                 <span className="font-black text-slate-700 tracking-tight uppercase italic text-sm">Grading Rubric v2.1</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">PDF • 1.2MB</span>
           </div>
        </div>
      </div>
    </div>

  );
}
