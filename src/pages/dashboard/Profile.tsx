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
  X,
  User,
  Heart,
  Briefcase,
  TrendingUp
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

export default function Profile() {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    contactNumber: profile?.contactNumber || '',
    internshipDomain: profile?.internshipDomain || '',
    gender: profile?.gender || 'Male',
    parentName: profile?.parentName || '',
    
    // Academics
    degree: profile?.degree || '',
    department: profile?.department || '',
    subject: profile?.subject || '',
    session: profile?.session || '',
    semester: profile?.semester || '',
    universityRoll: profile?.universityRoll || '',
    university: profile?.university || 'Veer Kunwar Singh University',
    college: profile?.college || 'Maharaja College, Ara',
    
    // Emergency Contact
    emergencyContactName: profile?.emergencyContactName || '',
    emergencyRelation: profile?.emergencyRelation || 'Parent',
    emergencyContactNumber: profile?.emergencyContactNumber || ''
  });

  useEffect(() => {
    fetchDegrees();
  }, []);

  useEffect(() => {
    if (!profile) return;

    setFormData({
      fullName: profile.fullName || '',
      contactNumber: profile.contactNumber || '',
      internshipDomain: profile.internshipDomain || '',
      gender: profile.gender || 'Male',
      parentName: profile.parentName || '',
      degree: profile.degree || '',
      department: profile.department || '',
      subject: profile.subject || '',
      session: profile.session || '',
      semester: profile.semester || '',
      universityRoll: profile.universityRoll || '',
      university: profile.university || 'Veer Kunwar Singh University',
      college: profile.college || 'Maharaja College, Ara',
      emergencyContactName: profile.emergencyContactName || '',
      emergencyRelation: profile.emergencyRelation || 'Parent',
      emergencyContactNumber: profile.emergencyContactNumber || ''
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

  const getSubjectsForDegree = (degreeName: string) => {
    const degree = degrees.find(d => d.name === degreeName);
    return degree?.subjects || [];
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
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

  // Helper renderers matching reference site subcomponents n, o, d
  const SectionPanel = ({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) => (
    <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-2xl p-6 md:p-8 mb-8 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-6 border-b border-gray-150 pb-3">
        <h3 className="text-xl font-extrabold text-gray-900 flex items-center">
          <span className="mr-2.5 text-2xl">{emoji}</span>
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {children}
      </div>
    </div>
  );

  const FieldCard = ({ title, value }: { title: string; value: any }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100/60 transition-colors">
      <h4 className="text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-wider">{title}</h4>
      <p className="text-gray-900 font-bold text-sm sm:text-base break-words">{value || 'Not provided'}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      
      {/* Upper header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md inline-block">
            Settings Workspace
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
            Student Profile Registry
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Here's your complete registration, verification, and internship information.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl font-bold text-xs uppercase tracking-wider"
            >
              Changes Saved ✓
            </motion.div>
          )}
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 px-6 transition active:scale-[0.98] cursor-pointer shadow-sm shadow-blue-500/10"
          >
            <Edit2 size={14} />
            Edit Profile
          </button>
        </div>
      </header>

      {/* 1. Personal Information */}
      <SectionPanel title="Personal Information" emoji="👤">
        <FieldCard title="Full Name" value={profile?.fullName} />
        <FieldCard title="Gender" value={profile?.gender || 'Male'} />
        <FieldCard title="Parent / Guardian Name" value={profile?.parentName} />
        <FieldCard title="Contact Number" value={profile?.contactNumber} />
        <FieldCard title="Email Address" value={profile?.email} />
      </SectionPanel>

      {/* 2. Academic Information */}
      <SectionPanel title="Academic Information" emoji="📚">
        <FieldCard title="University" value={profile?.university || 'Veer Kunwar Singh University'} />
        <FieldCard title="College" value={profile?.college || 'Maharaja College, Ara'} />
        <FieldCard title="Degree" value={profile?.degree} />
        <FieldCard title="Department" value={profile?.department} />
        <FieldCard title="Session" value={profile?.session} />
        <FieldCard title="University Roll Number" value={profile?.universityRoll} />
        <FieldCard title="Class / Semester" value={profile?.semester} />
      </SectionPanel>

      {/* 3. Emergency Contact */}
      <SectionPanel title="Emergency Contact" emoji="❤️">
        <FieldCard title="Contact Name" value={profile?.emergencyContactName} />
        <FieldCard title="Relation" value={profile?.emergencyRelation} />
        <FieldCard title="Emergency Number" value={profile?.emergencyContactNumber} />
      </SectionPanel>

      {/* 4. Internship Details */}
      <SectionPanel title="Internship Details" emoji="💼">
        <FieldCard title="Organization Name" value="OPTIMARK VENTURES PRIVATE LIMITED" />
        <FieldCard title="Organization CIN" value="U62020BR2023PTC064893" />
        <FieldCard title="Organization Contact" value="7544090878" />
        <FieldCard title="Internship Registration No." value="045310" />
        <FieldCard title="Internship Topic" value={profile?.internshipDomain} />
        <FieldCard title="Internship Duration" value="120 Hours" />
      </SectionPanel>

      {/* 5. Registration & Progress */}
      <SectionPanel title="Registration & Progress" emoji="📈">
        <FieldCard title="Registration Status" value={profile?.fullName ? 'Completed' : 'Pending'} />
        <FieldCard title="Payment Status" value={profile?.hasPaid ? 'Paid ✅' : 'Pending ❌'} />
        <FieldCard title="Certificate Status" value={(profile?.progress || 0) >= 100 ? 'Issued 🏆' : 'Not Yet 📄'} />
      </SectionPanel>

      {/* Edit Dialog Form */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl p-6 bg-white rounded-2xl shadow-xl">
          <DialogHeader className="pb-4 border-b border-gray-150">
            <DialogTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">Edit Profile Registry</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium">Update your profile parameters to keep documents accurate.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Personal */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Legal Name</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-12 rounded-xl border border-gray-200 px-4 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gender</Label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full h-12 rounded-xl border border-gray-200 px-4 focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Parent / Guardian Name</Label>
                <Input
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="h-12 rounded-xl border border-gray-200 px-4"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Number</Label>
                <Input
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="h-12 rounded-xl border border-gray-200 px-4"
                />
              </div>

              {/* Academics */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Degree</Label>
                <select
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full h-12 rounded-xl border border-gray-200 px-4 bg-white text-sm"
                >
                  <option value="">Select Degree</option>
                  {DEGREES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Department</Label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value, subject: '' })}
                  className="w-full h-12 rounded-xl border border-gray-200 px-4 bg-white text-sm"
                >
                  <option value="">Select Department</option>
                  {degrees.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</Label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full h-12 rounded-xl border border-gray-200 px-4 bg-white text-sm"
                >
                  <option value="">Select Subject</option>
                  {formData.department &&
                    getSubjectsForDegree(formData.department).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Session</Label>
                <select
                  value={formData.session}
                  onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                  className="w-full h-12 rounded-xl border border-gray-200 px-4 bg-white text-sm"
                >
                  <option value="">Select Session</option>
                  {SESSIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">University Roll Number</Label>
                <Input
                  value={formData.universityRoll}
                  onChange={(e) => setFormData({ ...formData, universityRoll: e.target.value })}
                  className="h-12 rounded-xl border border-gray-200 px-4"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Semester</Label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full h-12 rounded-xl border border-gray-200 px-4 bg-white text-sm"
                >
                  <option value="">Select Semester</option>
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Emergency */}
              <div className="space-y-2 md:col-span-2 border-t border-gray-150 pt-4 mt-2">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Emergency Contact Information</h4>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Emergency Contact Name</Label>
                <Input
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  className="h-12 rounded-xl border border-gray-200 px-4"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Relation</Label>
                <Input
                  value={formData.emergencyRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                  className="h-12 rounded-xl border border-gray-200 px-4"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Emergency Contact Number</Label>
                <Input
                  value={formData.emergencyContactNumber}
                  onChange={(e) => setFormData({ ...formData, emergencyContactNumber: e.target.value })}
                  className="h-12 rounded-xl border border-gray-200 px-4"
                />
              </div>

            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-150">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-250 bg-white px-6 text-xs font-bold text-gray-700 hover:bg-gray-50 transition active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 text-xs font-bold text-white hover:bg-blue-700 transition active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
