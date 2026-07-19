import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, getAuth, signOut } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { handleFirestoreError, OperationType } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../components/AuthContext';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  DEGREES,
  GENDERS,
  SESSIONS,
  SEMESTERS
} from '../lib/constants';
import {
  ChevronRight, ChevronLeft, GraduationCap, ArrowRight, ShieldCheck, User,
  School, AlertCircle, Handshake, Mail, Phone, Lock, FileText, CheckCircle2,
  Users, BookOpen, Clock, ThumbsUp, Sparkles, Building2, Facebook,
  Instagram, Twitter, Linkedin, Youtube, Check, Award, Headset
} from 'lucide-react';

interface District {
  id: string;
  name: string;
}

interface College {
  id: string;
  name: string;
  districtId: string;
  price: number;
}

interface University {
  id: string;
  name: string;
}

interface Course {
  id: string;
  name: string;
  price: number;
}

interface Degree {
  id: string;
  name: string;
  subjects: string[];
}

interface RegisterProps {
  mode?: 'public' | 'emitraStudent';
}

const WhatsAppIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.321 5.325 0 11.866 0c3.171.001 6.151 1.237 8.391 3.479 2.24 2.24 3.473 5.222 3.471 8.397-.003 6.541-5.325 11.862-11.866 11.862-2.001-.001-3.97-.507-5.713-1.47L0 24zm6.59-15.659c-.224-.498-.46-.508-.673-.517-.174-.007-.373-.007-.573-.007-.2 0-.523.074-.797.373-.273.3-1.045 1.02-1.045 2.487 0 1.468 1.07 2.885 1.22 3.085.149.2 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m0 0" />
  </svg>
);

let registrationConfigCache: {
  districts: District[];
  colleges: College[];
  universities: University[];
  courses: Course[];
  degrees: Degree[];
} | null = null;

export default function Register({ mode = 'public' }: RegisterProps) {
  const { user: currentUser, emitraProfile } = useAuth();
  const isEmitraStudentMode = mode === 'emitraStudent';
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [districts, setDistricts] = useState<District[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Immediate validation states
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [phoneCheckLoading, setPhoneCheckLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    parentName: '',
    contactNumber: '',
    email: '',
    district: '',
    college: '',
    university: '',
    degree: '',
    department: '',
    subject: '',
    session: '',
    semester: 'Semester 5',
    universityRoll: '',
    internshipDomain: '',
    internshipMode: 'Online',
    password: '',
    confirmPassword: '',
    terms: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    setError(null);
    if (name === 'email') setEmailError(null);
    if (name === 'contactNumber') setPhoneError(null);
  };

  const handleEmailBlur = async () => {
    const emailVal = formData.email.trim();
    if (!emailVal || !emailVal.includes('@')) return;
    setEmailCheckLoading(true);
    setEmailError(null);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', emailVal));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setEmailError("This email is already registered.");
        setError("This email is already registered. Please use a different email.");
      }
    } catch (err) {
      console.warn("Failed to check duplicate email:", err);
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handlePhoneBlur = async () => {
    const phoneVal = formData.contactNumber.trim();
    if (!phoneVal || phoneVal.length < 10) return;
    setPhoneCheckLoading(true);
    setPhoneError(null);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('contactNumber', '==', phoneVal));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setPhoneError("This contact number is already registered.");
        setError("This contact number is already registered. Please use a different contact number.");
      }
    } catch (err) {
      console.warn("Failed to check duplicate phone:", err);
    } finally {
      setPhoneCheckLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (registrationConfigCache) {
        setDistricts(registrationConfigCache.districts);
        setColleges(registrationConfigCache.colleges);
        setUniversities(registrationConfigCache.universities);
        setCourses(registrationConfigCache.courses);
        setDegrees(registrationConfigCache.degrees);
        setDataLoading(false);
        return;
      }

      const districtsRef = collection(db, 'districts');
      const districtsQuery = query(districtsRef, orderBy('name'));

      const universitiesRef = collection(db, 'universities');
      const universitiesQuery = query(universitiesRef, orderBy('name'));

      const coursesRef = collection(db, 'courses');
      const coursesQuery = query(coursesRef, orderBy('name'));

      const collegesRef = collection(db, 'colleges');

      const degreesRef = collection(db, 'degrees');
      const degreesQuery = query(degreesRef, orderBy('name'));

      const [
        districtsSnapshot,
        universitiesSnapshot,
        coursesSnapshot,
        collegesSnapshot,
        degreesSnapshot
      ] = await Promise.all([
        getDocs(districtsQuery),
        getDocs(universitiesQuery),
        getDocs(coursesQuery),
        getDocs(collegesRef),
        getDocs(degreesQuery)
      ]);

      registrationConfigCache = {
        districts: districtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as District)),
        colleges: collegesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as College)),
        universities: universitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as University)),
        courses: coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)),
        degrees: degreesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Degree))
      };

      setDistricts(registrationConfigCache.districts);
      setColleges(registrationConfigCache.colleges);
      setUniversities(registrationConfigCache.universities);
      setCourses(registrationConfigCache.courses);
      setDegrees(registrationConfigCache.degrees);

      setDataLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setDataLoading(false);
    }
  };

  const getCollegesForDistrict = (districtName: string) => {
    const district = districts.find(d => d.name === districtName);
    if (!district) return [];
    return colleges.filter(c => c.districtId === district.id);
  };

  const getSubjectsForDegree = (degreeName: string) => {
    const degree = degrees.find(d => d.name === degreeName);
    return degree?.subjects || [];
  };

  const nextStep = async () => {
    if (step === 1) {
      if (!formData.fullName || !formData.gender || !formData.parentName || !formData.contactNumber || !formData.email) {
        setError("Please fill all personal information fields.");
        return;
      }

      setLoading(true);
      setError(null);
      setEmailError(null);
      setPhoneError(null);

      try {
        const usersRef = collection(db, 'users');

        // Parallel email and phone checks
        const emailQ = query(usersRef, where('email', '==', formData.email.trim()));
        const phoneQ = query(usersRef, where('contactNumber', '==', formData.contactNumber.trim()));

        const [emailSnap, phoneSnap] = await Promise.all([
          getDocs(emailQ),
          getDocs(phoneQ)
        ]);

        if (!emailSnap.empty) {
          setEmailError("This email is already registered.");
          setError("This email is already registered. Please use a different email.");
          setLoading(false);
          return;
        }

        if (!phoneSnap.empty) {
          setPhoneError("This contact number is already registered.");
          setError("This contact number is already registered. Please use a different contact number.");
          setLoading(false);
          return;
        }
      } catch (checkErr) {
        console.warn("Duplicate email/phone lookup query failed:", checkErr);
      } finally {
        setLoading(false);
      }
    }

    if (step === 2) {
      if (!formData.district || !formData.college || !formData.university || !formData.degree || !formData.department || !formData.subject || !formData.session || !formData.semester || !formData.universityRoll || !formData.internshipDomain) {
        setError("Please fill all academic details.");
        return;
      }
    }

    if (step === 3) {
      if (!formData.password || !formData.confirmPassword) {
        setError("Please define your secret password.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!formData.terms) {
      setError("You must agree to the Terms and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      const studentAuth = isEmitraStudentMode
        ? getAuth(getApps().some(app => app.name === 'emitra-student-create-app')
          ? getApp('emitra-student-create-app')
          : initializeApp(firebaseConfig, 'emitra-student-create-app'))
        : auth;

      const userCredential = await createUserWithEmailAndPassword(studentAuth, formData.email, formData.password);
      const user = userCredential.user;

      const path = `users/${user.uid}`;
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          fullName: formData.fullName,
          gender: formData.gender,
          parentName: formData.parentName,
          contactNumber: formData.contactNumber,
          email: formData.email,
          district: formData.district,
          college: formData.college,
          university: formData.university,
          degree: formData.degree,
          department: formData.department,
          subject: formData.subject,
          session: formData.session,
          semester: formData.semester,
          universityRoll: formData.universityRoll,
          internshipDomain: formData.internshipDomain,
          internshipMode: formData.internshipMode || 'Online',
          createdByEmitraId: isEmitraStudentMode ? currentUser?.uid || '' : null,
          createdByEmitraName: isEmitraStudentMode ? emitraProfile?.centerName || '' : null,
          isPaid: false,
          registrationDate: new Date().toISOString(),
          learningHours: 0,
          progress: 0
        });
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.WRITE, path);
      }

      if (isEmitraStudentMode) {
        await signOut(studentAuth).catch(() => undefined);
        navigate(`/emitra/payment/${user.uid}`);
      } else {
        navigate('/payment');
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please use a different email.");
        setStep(1);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { title: 'Personal', sub: 'Basic Information', icon: User },
    { title: 'Academic', sub: 'Educational Details', icon: GraduationCap },
    { title: 'Security', sub: 'Account Security', icon: ShieldCheck },
    { title: 'Consent Letter', sub: 'Review & Submit', icon: FileText }
  ];

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Registration Config...</p>
        </div>
      </div>
    );
  }

  const getStepProgressText = () => {
    if (step === 1) return "25% Completed";
    if (step === 2) return "50% Completed";
    if (step === 3) return "75% Completed";
    return "95% Completed";
  };

  const getStepProgressPercent = () => {
    if (step === 1) return 25;
    if (step === 2) return 50;
    if (step === 3) return 75;
    return 95;
  };

  const getStepIcon = () => {
    if (step === 1) return User;
    if (step === 2) return GraduationCap;
    if (step === 3) return ShieldCheck;
    return FileText;
  };

  const ActiveIcon = getStepIcon();

  return (
    <div className="bg-[#f8fafc] overflow-hidden select-none font-sans text-left">

      {/* HEADER SECTION */}
      <section className="py-12 text-center space-y-4 max-w-4xl mx-auto px-4">
        <div className="w-14 h-14 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <FileText size={24} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
          Student <span className="text-blue-600">Registration</span>
        </h1>
        <p className="text-slate-500 font-semibold text-sm sm:text-base leading-relaxed">
          Complete your registration for the UGC-mandated internship program
        </p>
      </section>

      {/* STEPPER TIMELINE */}
      <section className="max-w-4xl mx-auto px-4 mb-10">
        <div className="flex items-center justify-between w-full relative z-0">
          {stepsList.map((s, i) => {
            const isCompleted = step > i + 1;
            const isActive = step === i + 1;

            return (
              <React.Fragment key={i}>
                {/* Horizontal connecting lines */}
                {i > 0 && (
                  <div className={`flex-1 h-0.5 mx-1 sm:mx-4 self-start mt-[18px] transition-colors duration-500 ${step > i
                    ? 'bg-blue-600'
                    : 'border-t-2 border-dashed border-slate-200'
                    }`} />
                )}

                {/* Step Circle & Description */}
                <div className="flex flex-col items-center space-y-2.5 z-10 shrink-0">
                  <div className={`w-9.5 h-9.5 rounded-full flex items-center justify-center border-2 text-xs font-black shadow-sm transition-all duration-300 ${isCompleted
                    ? 'bg-blue-650 border-blue-650 text-white'
                    : isActive
                      ? 'bg-blue-600 border-blue-600 text-white scale-105'
                      : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                    {isCompleted ? '✓' : i + 1}
                  </div>
                  <div className="text-center">
                    <span className={`text-[10px] md:text-xs block font-black leading-none ${isActive ? 'text-blue-600' : 'text-slate-805'}`}>
                      {s.title}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold tracking-tight hidden sm:block mt-0.5">
                      {s.sub}
                    </span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* FORM CONTAINER CARD */}
      <section className="max-w-4xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200/60 shadow-sm flex flex-col justify-between space-y-6">

          {/* Form Card Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 text-slate-650 rounded-2xl flex items-center justify-center shrink-0 border border-slate-150">
                <ActiveIcon size={20} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  {step === 1 ? 'Personal Information' : step === 2 ? 'Academic Details' : step === 3 ? 'Account Security' : 'Consent Letter'}
                </h3>
                <p className="text-xs text-slate-450 font-bold leading-none">
                  {step === 1 && 'Please provide your basic details accurately.'}
                  {step === 2 && 'Enter your educational track records.'}
                  {step === 3 && 'Choose a password for your account.'}
                  {step === 4 && 'Review your registration details and submit.'}
                </p>
              </div>
            </div>

            {/* Step Progress indicators */}
            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                {getStepProgressText()}
              </span>
              <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${getStepProgressPercent()}%` }} />
              </div>
              <span className="bg-blue-50 text-blue-600 font-extrabold px-2.5 py-1 rounded text-xs leading-none">
                Step {step} of 4
              </span>
            </div>
          </div>

          {/* Form body */}
          <AnimatePresence mode="wait">
            <motion.form
              key={step}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-5"
              onSubmit={step === 4 ? handleSubmit : (e) => e.preventDefault()}
            >
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4.5 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase tracking-tight">
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* STEP 1: PERSONAL INFORMATION */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="fullName" className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">Full Name (as per ID) *</Label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-3.5 text-slate-400" />
                      <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g. Abhishek Kumar" className="pl-11 h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs sm:text-sm" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="gender" className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">Gender *</Label>
                    <div className="relative">
                      <Users size={16} className="absolute left-4 top-3.5 text-slate-400" />
                      <select name="gender" value={formData.gender} onChange={handleChange} className="pl-11 pr-4 w-full h-12 rounded-xl border border-transparent bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs sm:text-sm appearance-none shadow-sm cursor-pointer">
                        <option value="">Select Gender</option>
                        {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="parentName" className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">Parent / Guardian Name *</Label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-3.5 text-slate-400" />
                      <Input id="parentName" name="parentName" value={formData.parentName} onChange={handleChange} placeholder="e.g. Harsh Prasad" className="pl-11 h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs sm:text-sm" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="contactNumber" className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">Phone Number *</Label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-3.5 text-slate-400" />
                      <Input id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleChange} onBlur={handlePhoneBlur} placeholder="10 digit contact number" className={`pl-11 h-12 rounded-xl bg-slate-50 transition-all font-semibold text-xs sm:text-sm ${phoneError ? 'border-red-500 bg-white ring-4 ring-red-500/10' : 'border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'}`} />
                      {phoneCheckLoading && <div className="absolute right-4 top-4 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
                    </div>
                    {phoneError && <p className="text-[10px] text-red-500 font-bold pl-1">{phoneError}</p>}
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="email" className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">Email ID *</Label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-3.5 text-slate-400" />
                      <Input id="email" type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleEmailBlur} placeholder="e.g. name@example.com" className={`pl-11 h-12 rounded-xl bg-slate-50 transition-all font-semibold text-xs sm:text-sm ${emailError ? 'border-red-500 bg-white ring-4 ring-red-500/10' : 'border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'}`} />
                      {emailCheckLoading && <div className="absolute right-4 top-4 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
                    </div>
                    {emailError && <p className="text-[10px] text-red-500 font-bold pl-1">{emailError}</p>}
                  </div>
                </div>
              )}

              {/* STEP 2: ACADEMIC DETAILS */}
              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[50vh] overflow-y-auto pr-1">

                  <div className="space-y-1.5 text-left md:col-span-2">
                    <Label htmlFor="university" className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">University *</Label>
                    <select name="university" value={formData.university} onChange={handleChange} className="w-full h-12 rounded-xl border border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs sm:text-sm appearance-none shadow-sm cursor-pointer">
                      <option value="">Select University</option>
                      {universities.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="district" className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">District *</Label>
                    <select name="district" value={formData.district} onChange={handleChange} className="w-full h-12 rounded-xl border border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs sm:text-sm appearance-none shadow-sm cursor-pointer">
                      <option value="">Select District</option>
                      {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="college" className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">College Affiliate *</Label>
                    <select name="college" value={formData.college} onChange={handleChange} className="w-full h-12 rounded-xl border border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs sm:text-sm appearance-none shadow-sm cursor-pointer">
                      <option value="">Select College</option>
                      {formData.district && getCollegesForDistrict(formData.district).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="degree" className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">Degree *</Label>
                    <select name="degree" value={formData.degree} onChange={handleChange} className="w-full h-12 rounded-xl border border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs sm:text-sm appearance-none shadow-sm cursor-pointer">
                      <option value="">Degree</option>
                      {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="department" className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">Branch *</Label>
                    <select name="department" value={formData.department} onChange={handleChange} className="w-full h-12 rounded-xl border border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs sm:text-sm appearance-none shadow-sm cursor-pointer">
                      <option value="">Department</option>
                      {degrees.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="subject" className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">Subject *</Label>
                    <select name="subject" value={formData.subject} onChange={handleChange} className="w-full h-12 rounded-xl border border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs sm:text-sm appearance-none shadow-sm cursor-pointer">
                      <option value="">Subject</option>
                      {formData.department && getSubjectsForDegree(formData.department).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="session" className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">Session *</Label>
                    <select name="session" value={formData.session} onChange={handleChange} className="w-full h-12 rounded-xl border border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs sm:text-sm appearance-none shadow-sm cursor-pointer">
                      <option value="">Session</option>
                      {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="semester" className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">Semester *</Label>
                    <select name="semester" value={formData.semester} onChange={handleChange} className="w-full h-12 rounded-xl border border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs sm:text-sm appearance-none shadow-sm cursor-pointer">
                      <option value="">Semester</option>
                      {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="universityRoll" className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">Roll Number *</Label>
                    <Input id="universityRoll" name="universityRoll" value={formData.universityRoll} onChange={handleChange} placeholder="As per ID Card" className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs sm:text-sm" />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="internshipDomain" className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">Internship Domain Track *</Label>
                    <select name="internshipDomain" value={formData.internshipDomain} onChange={handleChange} className="w-full h-12 rounded-xl border border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs sm:text-sm appearance-none shadow-sm cursor-pointer">
                      <option value="">Select Domain</option>
                      {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="internshipMode" className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">Mode of Internship *</Label>
                    <select name="internshipMode" value={formData.internshipMode} onChange={handleChange} className="w-full h-12 rounded-xl border border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs sm:text-sm appearance-none shadow-sm cursor-pointer">
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                </div>
              )}

              {/* STEP 3: ACCOUNT SECURITY */}
              {step === 3 && (
                <div className="grid grid-cols-1 gap-5 max-w-xl mx-auto">
                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="password" className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">Secret Password *</Label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-3.5 text-slate-400" />
                      <Input id="password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter a secure password" className="pl-11 h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs sm:text-sm" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="confirmPassword" className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 uppercase tracking-wider">Confirm Secret Password *</Label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-3.5 text-slate-400" />
                      <Input id="confirmPassword" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Verify password matches" className="pl-11 h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs sm:text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: CONSENT LETTER */}
              {step === 4 && (
                <div className="space-y-5 max-w-2xl mx-auto text-left">

                  {/* Undertaking Declaration Box */}
                  <div className="bg-amber-50/40 border border-amber-200/50 rounded-2xl p-5 md:p-6 shadow-inner text-left font-serif text-slate-800 text-xs sm:text-sm leading-relaxed space-y-4 max-h-[35vh] overflow-y-auto">
                    <h4 className="text-center font-bold uppercase tracking-wider text-slate-900 border-b border-amber-200/60 pb-2 text-sm sm:text-base">
                      Student Undertaking & Declaration
                    </h4>

                    <p>
                      I, <strong className="text-slate-955">{formData.fullName || '[Full Name]'}</strong>, son/daughter of <strong className="text-slate-955">{formData.parentName || '[Parent/Guardian Name]'}</strong>, student of <strong className="text-slate-955">{formData.college || '[College Name]'}</strong> pursuing <strong className="text-slate-955">{formData.degree || '[Degree]'}</strong> (Roll No: <strong className="text-slate-955">{formData.universityRoll || '[Roll Number]'}</strong>), hereby declare that I will diligently undertake the UGC-mandated Internship Program in <strong className="text-blue-700">{formData.internshipDomain || '[Internship Domain]'}</strong> starting from the registered academic session.
                    </p>

                    <p>
                      I agree to abide by the rules, code of conduct, assignment submissions, learning log schedules, and performance evaluations defined by InternMitra. I understand that credentials and certifications will only be issued upon verified completion of training hours and compliance metrics.
                    </p>

                    <div className="border-t border-amber-200/60 pt-4 flex justify-between items-end text-xs font-sans text-slate-500">
                      <div className="space-y-1">
                        <p className="uppercase tracking-wider text-[9px] text-slate-400 font-bold">Verification Date</p>
                        <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="uppercase tracking-wider text-[9px] text-slate-400 font-bold">Digitally Signed By</p>
                        <p className="font-bold text-slate-800 italic font-serif text-sm border-b border-dashed border-slate-400 pb-0.5 px-2">
                          {formData.fullName || 'Student'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 pt-2 group cursor-pointer text-left"
                    onClick={() => setFormData({ ...formData, terms: !formData.terms })}
                  >
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${formData.terms ? 'bg-blue-600 border-blue-600' : 'border-slate-200 bg-slate-50'
                      }`}>
                      {formData.terms && <Check size={12} className="stroke-[3] text-white" />}
                    </div>
                    <Label htmlFor="terms" className="text-xs text-slate-500 font-bold cursor-pointer select-none leading-relaxed">
                      I agree to the <span className="text-blue-600 font-black hover:underline">Terms of Service</span> and <span className="text-blue-600 font-black hover:underline">Privacy Policy</span>
                    </Label>
                  </div>
                </div>
              )}
            </motion.form>
          </AnimatePresence>

          {/* Stepper Navigation Actions */}
          <div className="flex items-center justify-between pt-5 border-t border-slate-100">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={prevStep}
                className="h-11 px-5 border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <ChevronLeft size={16} /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button
                onClick={nextStep}
                disabled={loading}
                className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                {loading ? 'Validating...' : 'Next Step'} <ChevronRight size={16} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-wider text-xs shadow-md shadow-blue-500/10 hover:scale-[1.01] transition-all cursor-pointer flex items-center gap-1.5"
              >
                {loading ? 'Processing...' : isEmitraStudentMode ? 'Register Student' : 'Complete Register'} <ArrowRight size={16} />
              </Button>
            )}
          </div>

        </div>
      </section>

      {/* WHATSAPP SUPPORT WIDGET (BANNER) */}
      <section className="max-w-4xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 border border-emerald-100/50">
              <WhatsAppIcon size={22} className="text-emerald-600" />
            </div>
            <div className="text-left space-y-0.5">
              <h3 className="text-base font-black text-slate-800 leading-tight">
                Call us: <a href="tel:+919693921517" className="hover:underline text-blue-600 font-extrabold">+91 96939 21517</a>
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Updates, deadlines & certificate info — join our WhatsApp channel for alerts.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-start gap-3.5 shrink-0">
            <a
              href="https://whatsapp.com/channel/0029VbDNWPACxoAsRFQgYz40"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black uppercase tracking-wider px-6 text-xs shadow-md transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0 w-full sm:w-auto"
            >
              <WhatsAppIcon size={16} />
              Join WhatsApp Channel
            </a>

            {/* Instant alerts check row */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 flex items-start gap-2.5 max-w-xs shrink-0">
              <ShieldCheck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
              <p className="text-[10px] text-emerald-800 font-bold leading-normal text-left">
                Instant support & important alerts — internship से जुड़ी मदद और updates के लिए।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INFORMATION SAFETY NOTICE */}
      <section className="max-w-4xl mx-auto px-4 mb-12">
        <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-5 flex items-start gap-3.5 text-left">
          <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h5 className="text-xs font-black text-slate-800 leading-none">Your information is safe with us.</h5>
            <p className="text-[11px] text-slate-450 font-bold leading-normal">We respect your privacy and never share your data with third parties.</p>
          </div>
        </div>
      </section>

      {/* WHY REGISTER STANDS OUT */}
      <section className="max-w-4xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: '100% Secure Registration', desc: 'Your data is protected with industry-standard encryption.', icon: ShieldCheck },
            { title: 'Quick & Easy Process', desc: 'Complete registration in just a few minutes and get started.', icon: Sparkles },
            { title: 'Verified Internships', desc: 'Access only verified and industry-approved internship programs.', icon: Award },
            { title: '24/7 Expert Support', desc: 'Our support team is always here to help you succeed.', icon: Headset }
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2.5xl p-5 border border-slate-200/50 shadow-sm flex flex-col text-left space-y-3.5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50 shrink-0">
                <item.icon size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">{item.title}</h4>
                <p className="text-[11px] text-slate-450 font-bold leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0b0e1a] text-white pt-20 pb-10 border-t border-slate-900 select-none text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 mb-16">

            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-new.jpeg"
                  alt="InternMitra Logo"
                  className="h-11 w-auto object-contain rounded-xl"
                />
                <div>
                  <h2 className="text-xl font-black tracking-tight">InternMitra</h2>
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Bihar's Internship Portal</p>
                </div>
              </div>

              <p className="text-slate-400 leading-relaxed text-xs sm:text-sm font-semibold max-w-sm">
                Structured digital internship portal providing industry-aligned training, project learning logs, and verified credentials.
              </p>

              <div className="flex gap-2.5">
                {[Facebook, Instagram, Twitter, Linkedin, Youtube].map((Icon, index) => (
                  <div
                    key={index}
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-300 mb-6">Platform</h3>
              <ul className="space-y-3.5 text-slate-400 text-xs font-semibold">
                <li><Link to="/features" className="hover:text-blue-400 transition-colors">Features</Link></li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">For Students</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">For Colleges</li>
                <li><Link to="/emitra-register" className="hover:text-blue-400 transition-colors">Cyber Cafe Partner</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-300 mb-6">Support</h3>
              <ul className="space-y-3.5 text-slate-400 text-xs font-semibold">
                <li className="hover:text-blue-400 cursor-pointer transition-colors">FAQs</li>
                <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact us</Link></li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Credentials</li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-300 mb-6">Legal</h3>
              <ul className="space-y-3.5 text-slate-400 text-xs font-semibold">
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Terms & Conditions</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Cookie Settings</li>
              </ul>
            </div>

          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-semibold text-slate-500">
            <p>© 2026 Internmitra. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-blue-500/80" />
              20,000+ Registered Scholars
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
