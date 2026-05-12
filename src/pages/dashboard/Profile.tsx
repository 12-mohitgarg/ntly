import React, { useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firebase';
import { INTERNSHIP_DOMAINS } from '../../lib/constants';
import { motion } from 'motion/react';
import { 
  UserCircle, 
  Mail, 
  Phone, 
  MapPin, 
  BookMarked,
  ShieldCheck,
  CreditCard,
  Save,
  Camera
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export default function Profile() {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    contactNumber: profile?.contactNumber || '',
    internshipDomain: profile?.internshipDomain || ''
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const path = `users/${user.uid}`;
      await updateDoc(doc(db, 'users', user.uid), formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-4 uppercase italic">Account / <span className="text-blue-600">Profile Settings</span></h1>
           <p className="text-xl text-slate-500 font-bold italic leading-relaxed">Personalize your digital identity and subject selection.</p>
        </div>
        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-8 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-emerald-100 shadow-xl shadow-emerald-500/10"
          >
            ✓ Changes Permanently Saved
          </motion.div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left Column: Avatar & Summary */}
        <div className="space-y-8">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-900/[0.02] text-center relative group overflow-hidden">
             <div className="relative z-10">
               <div className="w-36 h-36 bg-blue-600 rounded-[2.5rem] mx-auto mb-8 border-8 border-white shadow-2xl flex items-center justify-center text-6xl font-black text-white relative transition-transform group-hover:rotate-6">
                 {profile?.fullName.charAt(0)}
                 <button className="absolute -bottom-4 -right-4 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300">
                   <Camera size={20} />
                 </button>
               </div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic">{profile?.fullName}</h3>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 italic">{profile?.universityRoll}</p>
               
               <div className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block border border-blue-100 shadow-xl shadow-blue-500/5 italic">
                 {profile?.isPaid ? 'Verified Industry Scholar' : 'Baseline Account'}
               </div>
             </div>
             <div className="absolute top-0 left-0 w-32 h-32 bg-slate-50 rounded-full -translate-x-1/2 -translate-y-1/2" />
           </div>

           <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white space-y-8 shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
             <div className="flex items-center gap-6 relative z-10">
               <div className="w-12 h-12 bg-white/10 border border-white/5 rounded-2xl flex items-center justify-center text-blue-400 shadow-inner group-hover:scale-110 transition-transform">
                 <ShieldCheck size={24} />
               </div>
               <div>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] leading-none mb-1">Authorization</p>
                 <p className="text-sm font-black tracking-widest uppercase italic">Fully Verified</p>
               </div>
             </div>
             <div className="flex items-center gap-6 relative z-10">
               <div className="w-12 h-12 bg-white/10 border border-white/5 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
                 <CreditCard size={24} />
               </div>
               <div>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] leading-none mb-1">Escrow Balance</p>
                 <p className="text-sm font-black tracking-widest uppercase italic text-emerald-400">₹500.00 IN</p>
               </div>
             </div>
             <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-600/5 blur-3xl rounded-full" />
           </div>
        </div>

        {/* Right Column: Editable Fields */}
        <div className="md:col-span-2 space-y-10">
           <div className="bg-white p-10 lg:p-14 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-900/[0.02]">
             <form onSubmit={handleUpdate} className="space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Full Legal Name</Label>
                      <Input 
                        value={formData.fullName} 
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="h-16 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Personal Contact</Label>
                      <Input 
                        value={formData.contactNumber} 
                        onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                        className="h-16 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                      />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Primary Communication Axis</Label>
                    <div className="relative group">
                       <Input 
                         disabled
                         value={profile?.email} 
                         className="h-16 rounded-2xl bg-slate-100/50 border-transparent pl-14 font-black cursor-not-allowed text-slate-400 italic shadow-inner"
                       />
                       <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-slate-400 transition-colors" size={24} />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Chosen Industry Domain</Label>
                    <select 
                      value={formData.internshipDomain} 
                      onChange={(e) => setFormData({...formData, internshipDomain: e.target.value})}
                      className="w-full h-16 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 px-6 transition-all font-bold text-slate-900 appearance-none shadow-sm"
                    >
                      {INTERNSHIP_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                 </div>

                 <div className="pt-8">
                    <Button disabled={loading} className="w-full md:w-auto h-16 px-12 bg-blue-600 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-blue-600/20 flex items-center justify-center gap-3 transition-all duration-500 hover:scale-105 active:scale-95">
                      <Save size={20} />
                      {loading ? 'Commiting Changes...' : 'Synchronize Profile'}
                    </Button>
                 </div>
              </form>
           </div>

           {/* Read-only Academic Info */}
           <div className="bg-white p-10 lg:p-14 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-900/[0.02] relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-4 uppercase italic">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shadow-inner group-hover:bg-blue-50 transition-colors">
                    <BookMarked size={20} className="text-slate-400 group-hover:text-blue-600" />
                  </div>
                  Academic Registry
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-16">
                   {[
                     { label: 'University Axis', value: profile?.university },
                     { label: 'Involved College', value: profile?.college },
                     { label: 'Program Architecture', value: profile?.degree + ' / ' + profile?.department },
                     { label: 'Core Subject', value: profile?.subject },
                     { label: 'Active Session', value: profile?.session },
                     { label: 'Current Semester', value: profile?.semester },
                   ].map(item => (
                     <div key={item.label} className="group-hover:translate-x-1 transition-transform duration-500">
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] leading-none mb-2 italic border-l-2 border-slate-200 pl-3">{item.label}</p>
                       <p className="text-base font-black text-slate-900 italic truncate tracking-tight">{item.value}</p>
                     </div>
                   ))}
                 </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 -z-0" />
           </div>
        </div>
      </div>
    </div>
  );
}
