import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { 
  BarChart3, 
  BookOpen, 
  MessageSquare, 
  FileCheck, 
  UserCircle, 
  Download, 
  Video,
  Award,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import OfferLetter from './dashboard/OfferLetter';
import LMS from './dashboard/LMS';
import Assignments from './dashboard/Assignments';
import Profile from './dashboard/Profile';
import Certifications from './dashboard/Certifications';

export default function Dashboard() {
  const { profile } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: 'Offer Letter', path: '', icon: Download },
    { name: 'Learning', path: 'lms', icon: Video },
    { name: 'Assignments', path: 'assignments', icon: FileCheck },
    { name: 'Certifications', path: 'certs', icon: Award },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col lg:flex-row overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none -mr-40 -mt-40" />
      
      {/* Sidebar */}
      <aside className="w-full lg:w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 lg:sticky lg:top-24 lg:h-[calc(100vh-96px)] relative z-20">
        <div className="p-10 flex-1 flex flex-col">
          <div className="flex items-center gap-5 mb-14 bg-slate-800/50 p-5 rounded-[2rem] border border-slate-700/50">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-600/20 border-4 border-slate-800 transition-transform hover:rotate-6">
              {profile?.fullName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] mb-1 italic">Authorized</p>
              <h4 className="text-sm font-black text-white truncate tracking-tighter uppercase italic">{profile?.fullName}</h4>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-4 pl-2 opacity-50 italic">Control Subsystems</h3>
            <nav className="space-y-3">
              {menuItems.map((item) => {
                const isActive = location.pathname.endsWith(item.path) || (item.path === '' && location.pathname.endsWith('dashboard'));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-500 group ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/20 translate-x-2' 
                        : 'text-slate-500 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-600 group-hover:text-blue-500 transition-colors'} />
                      <span className={`text-[10px] font-black uppercase tracking-[0.15em] italic ${isActive ? 'text-white' : ''}`}>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight size={14} className="text-white/50" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-10 mt-auto">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
             <div className="relative z-10">
               <div className="flex items-center justify-between text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 italic">
                 <span>Efficiency</span>
                 <span>{profile?.progress || 0}%</span>
               </div>
               <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden mb-6 shadow-inner">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${profile?.progress || 0}%` }}
                   className="bg-blue-600 h-full rounded-full shadow-lg shadow-blue-600/40"
                 />
               </div>
               <button className="w-full h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
                 Resume Track
               </button>
             </div>
             <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full" />
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-10 lg:p-20 overflow-y-auto w-full relative z-10">
        <div className="max-w-6xl mx-auto h-full">
          <Routes>
            <Route index element={<OfferLetter />} />
            <Route path="lms" element={<LMS />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="certs" element={<Certifications />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </div>
      </main>
    </div>

  );
}
