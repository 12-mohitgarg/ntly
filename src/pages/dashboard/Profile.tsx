import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firebase';
import {
  INTERNSHIP_DOMAINS,
  DEGREES,
  SESSIONS,
  SEMESTERS
} from '../../lib/constants';

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
  Camera,
  Edit2,
  Bell,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '../../components/ui/dialog';

interface Degree {
  id: string;
  name: string;
  subjects: string[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt?: string;
  isActive?: boolean;
}

export default function Profile() {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    contactNumber: profile?.contactNumber || '',
    internshipDomain: profile?.internshipDomain || '',

    degree: profile?.degree || '',
    department: profile?.department || '',
    subject: profile?.subject || '',
    session: profile?.session || '',
    semester: profile?.semester || '',
    universityRoll: profile?.universityRoll || ''
  });

  useEffect(() => {
    fetchDegrees();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!profile) return;

    setFormData({
      fullName: profile.fullName || '',
      contactNumber: profile.contactNumber || '',
      internshipDomain: profile.internshipDomain || '',
      degree: profile.degree || '',
      department: profile.department || '',
      subject: profile.subject || '',
      session: profile.session || '',
      semester: profile.semester || '',
      universityRoll: profile.universityRoll || ''
    });
  }, [profile]);

  const fetchDegrees = async () => {
    try {
      const degreesRef = collection(db, 'degrees');
      const degreesQuery = query(degreesRef, orderBy('name'));
      const degreesSnapshot = await getDocs(degreesQuery);
      const degreesData = degreesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Degree));
      setDegrees(degreesData);
    } catch (error) {
      console.error('Error fetching degrees:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const notificationsQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
      const notificationsSnapshot = await getDocs(notificationsQuery);
      const notificationsData = notificationsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Notification))
        .filter(notification => notification.isActive !== false);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const getSubjectsForDegree = (degreeName: string) => {
    const degree = degrees.find(d => d.name === degreeName);
    return degree?.subjects || [];
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const path = `users/${user.uid}`;
      await updateDoc(doc(db, 'users', user.uid), formData);
      setSuccess(true);
      setIsEditOpen(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-page max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-3">
          <span className="student-kicker">Settings</span>
          <h1 className="student-title">
            Account / <span className="gradient-text">Profile Settings</span>
          </h1>
          <p className="student-subtitle">Personalize your digital identity and subject selection.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-emerald-100 shadow-xl shadow-emerald-500/10"
            >
              Changes Saved
            </motion.div>
          )}
          <Button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="student-button-primary min-h-[48px] px-6"
          >
            <Edit2 size={16} />
            Edit Profile
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
        {/* Left Column: Avatar & Summary */}
        <div className="space-y-6 sm:space-y-8">
          <div className="student-card p-10 text-center relative group overflow-hidden">
            <div className="relative z-10">
              <div className="w-32 h-32 bg-indigo-600 rounded-[2rem] mx-auto mb-6 border-8 border-white shadow-2xl flex items-center justify-center text-5xl font-black text-white relative transition-transform group-hover:rotate-6">
                {profile?.fullName.charAt(0)}
                <button className="absolute -bottom-3 -right-3 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Camera size={16} />
                </button>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1 uppercase italic">{profile?.fullName}</h3>
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.25em] mb-6 italic">{profile?.universityRoll}</p>

              <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest inline-block border border-indigo-100 shadow-xl shadow-indigo-500/5 italic">
                {profile?.isPaid ? 'Verified Industry Scholar' : 'Baseline Account'}
              </div>
            </div>
            <div className="absolute top-0 left-0 w-24 h-24 bg-slate-50 rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>

          <div className="student-panel p-8 space-y-6 relative overflow-hidden group">
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 bg-white/10 border border-white/5 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider leading-none mb-1">Authorization</p>
                <p className="text-xs font-black tracking-wider uppercase italic">Fully Verified</p>
              </div>
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 bg-white/10 border border-white/5 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider leading-none mb-1">Escrow Balance</p>
                <p className="text-xs font-black tracking-wider uppercase italic text-emerald-400">₹1000.00 IN</p>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-indigo-600/5 blur-2xl rounded-full" />
          </div>
        </div>

        {/* Right Column: Profile Details */}
        <div className="md:col-span-2 space-y-8">
          <div className="student-card p-6 sm:p-10">
            <div className="flex items-center justify-between gap-4 mb-8">
              <h4 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase italic">
                <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shadow-inner">
                  <UserCircle size={18} className="text-indigo-600" />
                </div>
                Personal Details
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['Full Legal Name', profile?.fullName || '-'],
                ['Personal Contact', profile?.contactNumber || '-'],
                ['Email Address', profile?.email || '-'],
                ['Industry Domain', profile?.internshipDomain || '-']
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50/50 p-4 sm:p-5 border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
                  <p className="text-sm font-black text-slate-900 break-words">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="student-card p-6 sm:p-10 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 uppercase italic">
                <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shadow-inner group-hover:bg-indigo-50 transition-colors">
                  <BookMarked size={18} className="text-slate-400 group-hover:text-indigo-600" />
                </div>
                Academic Registry
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['University', profile?.university || '-'],
                  ['College', profile?.college || '-'],
                  ['Degree', profile?.degree || '-'],
                  ['Department', profile?.department || '-'],
                  ['Subject', profile?.subject || '-'],
                  ['Session', profile?.session || '-'],
                  ['University Roll Number', profile?.universityRoll || '-'],
                  ['Semester', profile?.semester || '-']
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-50/50 p-4 sm:p-5 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
                    <p className="text-sm font-black text-slate-900 break-words">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 -z-0" />
          </div>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 uppercase italic">Edit Profile</DialogTitle>
            <DialogDescription>Update your profile information and save the changes.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="student-label">Full Legal Name</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="student-input h-12 px-4"
                />
              </div>
              <div className="space-y-2">
                <Label className="student-label">Personal Contact</Label>
                <Input
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="student-input h-12 px-4"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="student-label">Email Address</Label>
                <div className="relative">
                  <Input
                    disabled
                    value={profile?.email || ''}
                    className="student-input h-12 pl-12 text-slate-400 bg-slate-50"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="student-label">Chosen Industry Domain</Label>
                <select
                  value={formData.internshipDomain}
                  onChange={(e) => setFormData({ ...formData, internshipDomain: e.target.value })}
                  className="student-input h-12 px-4"
                >
                  {INTERNSHIP_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="student-label">Degree</Label>
                <select
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="student-input h-12 px-4"
                >
                  <option value="">Select Degree</option>
                  {DEGREES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="student-label">Department</Label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value, subject: '' })}
                  className="student-input h-12 px-4"
                >
                  <option value="">Select Department</option>
                  {degrees.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="student-label">Subject</Label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="student-input h-12 px-4"
                >
                  <option value="">Select Subject</option>
                  {formData.department &&
                    getSubjectsForDegree(formData.department).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="student-label">Session</Label>
                <select
                  value={formData.session}
                  onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                  className="student-input h-12 px-4"
                >
                  <option value="">Select Session</option>
                  {SESSIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="student-label">University Roll Number</Label>
                <Input
                  value={formData.universityRoll}
                  onChange={(e) => setFormData({ ...formData, universityRoll: e.target.value })}
                  placeholder="Enter Roll Number"
                  className="student-input h-12 px-4"
                />
              </div>
              <div className="space-y-2">
                <Label className="student-label">Semester</Label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="student-input h-12 px-4"
                >
                  <option value="">Select Semester</option>
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="student-button-soft h-12 px-6"
              >
                <X size={16} />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="student-button-primary h-12 px-7"
              >
                <Save size={16} />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
