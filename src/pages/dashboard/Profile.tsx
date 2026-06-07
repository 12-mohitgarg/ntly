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
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-4 uppercase italic">Account / <span className="text-blue-600">Profile Settings</span></h1>
          <p className="text-xl text-slate-500 font-bold italic leading-relaxed">Personalize your digital identity and subject selection.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-8 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-emerald-100 shadow-xl shadow-emerald-500/10"
            >
              Changes Saved
            </motion.div>
          )}
          <Button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="h-14 px-7 bg-blue-600 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-[0.18em] rounded-2xl flex items-center gap-3"
          >
            <Edit2 size={18} />
            Edit Profile
          </Button>
        </div>
      </header>

      {/* {notifications.length > 0 && (
        <section className="bg-white p-8 rounded-[2rem] border border-blue-100 shadow-2xl shadow-blue-600/[0.04]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Bell size={22} />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase italic">Notifications</h2>
          </div>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <article key={notification.id} className="border-l-4 border-blue-600 bg-slate-50 p-5 rounded-r-2xl">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <h3 className="font-black text-slate-900">{notification.title}</h3>
                  {notification.createdAt && (
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      {new Date(notification.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-600 whitespace-pre-line">{notification.message}</p>
              </article>
            ))}
          </div>
        </section>
      )} */}

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
                <p className="text-sm font-black tracking-widest uppercase italic text-emerald-400">₹1000.00 IN</p>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-600/5 blur-3xl rounded-full" />
          </div>
        </div>

        {/* Right Column: Profile Details */}
        <div className="md:col-span-2 space-y-10">
          <div className="bg-white p-10 lg:p-14 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-900/[0.02]">
            <div className="flex items-center justify-between gap-4 mb-10">
              <h4 className="text-2xl font-black text-slate-900 flex items-center gap-4 uppercase italic">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shadow-inner">
                  <UserCircle size={20} className="text-blue-600" />
                </div>
                Personal Details
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ['Full Legal Name', profile?.fullName || '-'],
                ['Personal Contact', profile?.contactNumber || '-'],
                ['Email Address', profile?.email || '-'],
                ['Industry Domain', profile?.internshipDomain || '-']
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
                  <p className="text-base font-black text-slate-900 break-words">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-10 lg:p-14 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-900/[0.02] relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-4 uppercase italic">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shadow-inner group-hover:bg-blue-50 transition-colors">
                  <BookMarked size={20} className="text-slate-400 group-hover:text-blue-600" />
                </div>
                Academic Registry
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div key={label} className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
                    <p className="text-base font-black text-slate-900 break-words">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 -z-0" />
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
                <Label>Full Legal Name</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-12 rounded-2xl bg-slate-50 border-transparent font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label>Personal Contact</Label>
                <Input
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="h-12 rounded-2xl bg-slate-50 border-transparent font-bold"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Email Address</Label>
                <div className="relative">
                  <Input
                    disabled
                    value={profile?.email || ''}
                    className="h-12 rounded-2xl bg-slate-100 border-transparent pl-12 font-bold text-slate-400"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Chosen Industry Domain</Label>
                <select
                  value={formData.internshipDomain}
                  onChange={(e) => setFormData({ ...formData, internshipDomain: e.target.value })}
                  className="w-full h-12 rounded-2xl bg-slate-50 border-transparent px-4 font-bold text-slate-900"
                >
                  {INTERNSHIP_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Degree</Label>
                <select
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full h-12 rounded-2xl bg-slate-50 px-4 font-bold"
                >
                  <option value="">Select Degree</option>
                  {DEGREES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value, subject: '' })}
                  className="w-full h-12 rounded-2xl bg-slate-50 px-4 font-bold"
                >
                  <option value="">Select Department</option>
                  {degrees.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full h-12 rounded-2xl bg-slate-50 px-4 font-bold"
                >
                  <option value="">Select Subject</option>
                  {formData.department &&
                    getSubjectsForDegree(formData.department).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Session</Label>
                <select
                  value={formData.session}
                  onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                  className="w-full h-12 rounded-2xl bg-slate-50 px-4 font-bold"
                >
                  <option value="">Select Session</option>
                  {SESSIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>University Roll Number</Label>
                <Input
                  value={formData.universityRoll}
                  onChange={(e) => setFormData({ ...formData, universityRoll: e.target.value })}
                  placeholder="Enter Roll Number"
                  className="h-12 rounded-2xl bg-slate-50 border-transparent px-4 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full h-12 rounded-2xl bg-slate-50 px-4 font-bold"
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
                className="h-12 px-6 font-black"
              >
                <X size={18} />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="h-12 px-7 bg-blue-600 hover:bg-slate-900 text-white font-black"
              >
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
