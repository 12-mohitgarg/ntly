import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, getAuth, signOut } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
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
import { ChevronRight, ChevronLeft, GraduationCap, ArrowRight, ShieldCheck, User, School, AlertCircle, Handshake } from 'lucide-react';

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
    semester: '',
    universityRoll: '',
    internshipDomain: '',
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

  const getCoursePrice = (courseName: string) => {
    const course = courses.find(c => c.name === courseName);
    return course?.price || 0;
  };

  const getCollegePrice = (collegeName: string) => {
    const college = colleges.find(c => c.name === collegeName);
    return college?.price || 0;
  };

  const getSubjectsForDegree = (degreeName: string) => {
    const degree = degrees.find(d => d.name === degreeName);
    return degree?.subjects || [];
  };

  const nextStep = () => {
    if (step === 1 && (!formData.fullName || !formData.gender || !formData.parentName || !formData.contactNumber || !formData.email)) {
      setError("Please fill all personal information fields.");
      return;
    }
    if (step === 2 && (!formData.district || !formData.college || !formData.university || !formData.degree || !formData.department || !formData.subject || !formData.session || !formData.semester || !formData.universityRoll || !formData.internshipDomain)) {
      setError("Please fill all academic information fields.");
      return;
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

  const steps = [
    { title: 'Personal Info', icon: User },
    { title: 'Academic Info', icon: GraduationCap },
    { title: 'Account Security', icon: ShieldCheck }
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

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-blue-50/40 via-white to-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-soft border border-slate-150/60 overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* Sidebar Info */}
        <div className="md:w-1/3 bg-[#0c1329] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden border-r border-slate-900">
          <div className="relative z-10 space-y-8">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 hover:rotate-6 transition-transform">
              <Handshake size={24} />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">Join the Future</h2>
              <p className="text-slate-400 leading-relaxed font-semibold text-xs">
                {isEmitraStudentMode
                  ? 'Register a student under your Cyber cafe. The student will continue through the same payment and dashboard flow.'
                  : 'Complete your registration to access premium internship domains and industry certifications.'}
              </p>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-5 pt-4">
              {steps.map((s, i) => (
                <div 
                  key={s.title} 
                  className={`flex items-center gap-3.5 transition-all duration-300 ${
                    step > i + 1 
                      ? 'opacity-100' 
                      : step === i + 1 
                        ? 'opacity-100 scale-102 font-extrabold text-blue-400' 
                        : 'opacity-30'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 ${
                    step > i + 1 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'border-slate-800 bg-slate-900'
                  }`}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold">{s.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-[9px] text-slate-500 font-extrabold uppercase tracking-widest relative z-10">
            © 2026 INTERNMITRA.
          </div>
          {/* Decorative blur */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />
        </div>

        {/* Form Area */}
        <div className="md:w-2/3 p-8 sm:p-12 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Step Heading and Progress Bar */}
            <div className="flex justify-between items-end border-b border-slate-100 pb-4">
              <div>
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Step {step} of 3</span>
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight uppercase mt-0.5">{steps[step - 1].title}</h3>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                {Math.round((step / 3) * 100)}% Complete
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden w-full">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={step}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="space-y-4 pt-4"
                onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}
              >
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-tight">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                {step === 1 && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Full Name (Legal)</Label>
                      <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g. Abhishek Kumar" className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm shadow-inner" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="gender" className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Gender</Label>
                      <select name="gender" value={formData.gender} onChange={handleChange} className="w-full h-12 rounded-xl border border-slate-200/40 bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm appearance-none shadow-sm cursor-pointer">
                        <option value="">Select Gender</option>
                        {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="parentName" className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Parent/Guardian Name</Label>
                      <Input id="parentName" name="parentName" value={formData.parentName} onChange={handleChange} placeholder="e.g. Harsh Prasad" className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm shadow-inner" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="contactNumber" className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Contact Number</Label>
                        <Input id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="10 digit contact" className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm shadow-inner" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Email ID</Label>
                        <Input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. name@domain.com" className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm shadow-inner" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid grid-cols-1 gap-4 max-h-[50vh] overflow-y-auto pr-1">
                    <div className="space-y-1.5">
                      <Label htmlFor="university" className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">University</Label>
                      <select name="university" value={formData.university} onChange={handleChange} className="w-full h-12 rounded-xl border border-slate-200/40 bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm appearance-none shadow-sm cursor-pointer">
                        <option value="">Select University</option>
                        {universities.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="district" className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">District</Label>
                        <select name="district" value={formData.district} onChange={handleChange} className="w-full h-12 rounded-xl border border-slate-200/40 bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm appearance-none shadow-sm cursor-pointer">
                          <option value="">Select District</option>
                          {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="college" className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">College Affiliate</Label>
                        <select name="college" value={formData.college} onChange={handleChange} className="w-full h-12 rounded-xl border border-slate-200/40 bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm appearance-none shadow-sm cursor-pointer">
                          <option value="">Select College</option>
                          {formData.district && getCollegesForDistrict(formData.district).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="degree" className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Degree</Label>
                        <select name="degree" value={formData.degree} onChange={handleChange} className="w-full h-12 rounded-xl border border-slate-200/40 bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm appearance-none shadow-sm cursor-pointer">
                          <option value="">Degree</option>
                          {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="department" className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Branch</Label>
                        <select name="department" value={formData.department} onChange={handleChange} className="w-full h-12 rounded-xl border border-slate-200/40 bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm appearance-none shadow-sm cursor-pointer">
                          <option value="">Branch</option>
                          {degrees.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="subject" className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Subject</Label>
                        <select name="subject" value={formData.subject} onChange={handleChange} className="w-full h-12 rounded-xl border border-slate-200/40 bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm appearance-none shadow-sm cursor-pointer">
                          <option value="">Subject</option>
                          {formData.department && getSubjectsForDegree(formData.department).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="session" className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Session</Label>
                        <select name="session" value={formData.session} onChange={handleChange} className="w-full h-12 rounded-xl border border-slate-200/40 bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm appearance-none shadow-sm cursor-pointer">
                          <option value="">Session</option>
                          {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="semester" className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Semester</Label>
                        <select name="semester" value={formData.semester} onChange={handleChange} className="w-full h-12 rounded-xl border border-slate-200/40 bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm appearance-none shadow-sm cursor-pointer">
                          <option value="">Semester</option>
                          {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="universityRoll" className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Roll Number</Label>
                        <Input id="universityRoll" name="universityRoll" value={formData.universityRoll} onChange={handleChange} placeholder="As per ID Card" className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm shadow-inner" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="internshipDomain" className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Internship Domain Track</Label>
                      <select name="internshipDomain" value={formData.internshipDomain} onChange={handleChange} className="w-full h-12 rounded-xl border border-slate-200/40 bg-slate-50 px-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm appearance-none shadow-sm cursor-pointer">
                        <option value="">Select Domain</option>
                        {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Secret Password</Label>
                      <Input id="password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter a secure password" className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm shadow-inner" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Confirm Secret Password</Label>
                      <Input id="confirmPassword" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Verify password matches" className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-sm shadow-inner" />
                    </div>

                    <div 
                      className="flex items-center gap-3 pt-4 group cursor-pointer" 
                      onClick={() => setFormData({ ...formData, terms: !formData.terms })}
                    >
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                        formData.terms ? 'bg-blue-600 border-blue-600' : 'border-slate-200 bg-slate-50'
                      }`}>
                        {formData.terms && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <Label htmlFor="terms" className="text-xs text-slate-500 font-semibold italic cursor-pointer select-none">
                        I agree to the <span className="text-blue-600 font-black hover:underline">Terms of Service</span> and <span className="text-blue-600 font-black hover:underline">Privacy Policy</span>
                      </Label>
                    </div>
                  </div>
                )}
              </motion.form>
            </AnimatePresence>
          </div>

          {/* Actions & WhatsApp Support Widget */}
          <div className="space-y-5 pt-8 mt-8 border-t border-slate-100">
            <div className="flex items-center justify-between gap-4">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  className="h-12 px-6 rounded-xl text-slate-400 hover:text-slate-800 font-black uppercase tracking-widest text-xs flex items-center justify-center transition-all cursor-pointer"
                >
                  <ChevronLeft className="mr-1.5 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button
                  onClick={nextStep}
                  className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs shadow-sm flex items-center justify-center cursor-pointer"
                >
                  Next Step
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading} 
                  className="h-12 px-8 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black uppercase tracking-widest text-xs shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.01] transition-all cursor-pointer"
                >
                  {loading ? 'Processing...' : isEmitraStudentMode ? 'Register Student' : 'Complete Register'} <ArrowRight className="ml-1.5 h-4 w-4 inline" />
                </Button>
              )}
            </div>

            {/* WhatsApp channel box at the bottom */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-600 font-semibold text-center sm:text-left">
                <span className="text-emerald-700 font-extrabold uppercase tracking-wide block">Need Assistance?</span>
                For query support or updates, join our WhatsApp support node.
              </div>
              <a 
                href="https://wa.me/919693921517" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 shadow-md shadow-green-500/10 cursor-pointer"
              >
                WhatsApp Helpline
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
