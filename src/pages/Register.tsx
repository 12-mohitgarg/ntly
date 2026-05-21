import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
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

export default function Register() {
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
      // Fetch districts
      const districtsRef = collection(db, 'districts');
      const districtsQuery = query(districtsRef, orderBy('name'));
      const districtsSnapshot = await getDocs(districtsQuery);
      setDistricts(districtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as District)));

      // Fetch universities
      const universitiesRef = collection(db, 'universities');
      const universitiesQuery = query(universitiesRef, orderBy('name'));
      const universitiesSnapshot = await getDocs(universitiesQuery);
      setUniversities(universitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as University)));

      // Fetch courses
      const coursesRef = collection(db, 'courses');
      const coursesQuery = query(coursesRef, orderBy('name'));
      const coursesSnapshot = await getDocs(coursesQuery);
      setCourses(coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));

      // Fetch colleges
      const collegesRef = collection(db, 'colleges');
      const collegesSnapshot = await getDocs(collegesRef);
      setColleges(collegesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as College)));

      // Fetch degrees with subjects
      const degreesRef = collection(db, 'degrees');
      const degreesQuery = query(degreesRef, orderBy('name'));
      const degreesSnapshot = await getDocs(degreesQuery);
      setDegrees(degreesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Degree)));

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
    // Validation for current step
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
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
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
          isPaid: false,
          registrationDate: new Date().toISOString(),
          learningHours: 0,
          progress: 0
        });
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.WRITE, path);
      }

      navigate('/payment');
    } catch (err: any) {
      // ✅ Email already exists → Step 1 pe wapas bhejo
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please use a different email.");
        setStep(1); // ← Step 1 pe wapas
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

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/5 overflow-hidden flex flex-col md:flex-row border border-slate-100">
        {/* Sidebar Info */}
        <div className="md:w-1/3 bg-slate-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-[#1e40af] rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-blue-600/20 transition-transform hover:rotate-12">
              <Handshake size={28} />
            </div>
            <h2 className="text-3xl font-extrabold mb-4 tracking-tighter leading-tight italic">Join the Future <br />of Learning.</h2>
            <p className="text-slate-400 mb-8 leading-relaxed font-medium italic text-sm">Complete your registration to access premium internship domains and industry certifications.</p>

            <div className="space-y-6">
              {steps.map((s, i) => (
                <div key={s.title} className={`flex items-center gap-4 transition-all duration-300 ${step > i + 1 ? 'opacity-100' : step === i + 1 ? 'opacity-100 scale-105 font-bold' : 'opacity-30'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${step > i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-700'}`}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className="text-xs uppercase tracking-widest font-black">{s.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 text-[10px] text-slate-500 font-black uppercase tracking-widest relative z-10">
            © 2026 INTERNMITRA. UGC Compliant Platform.
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-x-1/2 translate-y-1/2 blur-2xl" />
        </div>

        {/* Form Area */}
        <div className="md:w-2/3 p-10 lg:p-16 flex flex-col">
          <div className="mb-12">
            <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Step {step} of 3</div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">{steps[step - 1].title}</h3>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 flex-grow"
              onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}
            >
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 text-xs font-bold animate-pulse uppercase tracking-tight">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Full Name (Legal)</Label>
                    <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g. Abhishek Kumar" className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Gender Identification</Label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full h-14 rounded-2xl border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 transition-all font-bold text-sm">
                      <option value="">Select Gender</option>
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentName" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Guardian Name</Label>
                    <Input id="parentName" name="parentName" value={formData.parentName} onChange={handleChange} placeholder="e.g. Harsh Prasad" className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 font-bold" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Active Contact</Label>
                      <Input id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="10 digit number" className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email ID</Label>
                      <Input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. abhishek@gmail.com" className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 font-bold" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="university" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">University</Label>
                    <select name="university" value={formData.university} onChange={handleChange} className="w-full h-14 rounded-2xl border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 transition-all font-bold text-sm">
                      <option value="">Select University</option>
                      {universities.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">District</Label>
                    <select name="district" value={formData.district} onChange={handleChange} className="w-full h-14 rounded-2xl border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 transition-all font-bold text-sm">
                      <option value="">Select District</option>
                      {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="college" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">College Affiliate</Label>
                    <select name="college" value={formData.college} onChange={handleChange} className="w-full h-14 rounded-2xl border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 transition-all font-bold text-sm">
                      <option value="">Select College</option>
                      {formData.district && getCollegesForDistrict(formData.district).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="degree" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Degree</Label>
                      <select name="degree" value={formData.degree} onChange={handleChange} className="w-full h-14 rounded-2xl border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 transition-all font-bold text-sm">
                        <option value="">Degree</option>
                        {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Branch</Label>
                      <select name="department" value={formData.department} onChange={handleChange} className="w-full h-14 rounded-2xl border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 transition-all font-bold text-sm">
                        <option value="">Branch</option>
                        {degrees.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Subject</Label>
                      <select name="subject" value={formData.subject} onChange={handleChange} className="w-full h-14 rounded-2xl border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 transition-all font-bold text-sm">
                        <option value="">Subject</option>
                        {formData.department && getSubjectsForDegree(formData.department).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="session" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Academic Session</Label>
                      <select name="session" value={formData.session} onChange={handleChange} className="w-full h-14 rounded-2xl border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 transition-all font-bold text-sm">
                        <option value="">Session</option>
                        {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="semester" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Semester</Label>
                      <select name="semester" value={formData.semester} onChange={handleChange} className="w-full h-14 rounded-2xl border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 transition-all font-bold text-sm">
                        <option value="">Class</option>
                        {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="universityRoll" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Roll Number</Label>
                      <Input id="universityRoll" name="universityRoll" value={formData.universityRoll} onChange={handleChange} placeholder="As per ID card" className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 font-bold" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="internshipDomain" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Target Domain</Label>
                    <select name="internshipDomain" value={formData.internshipDomain} onChange={handleChange} className="w-full h-14 rounded-2xl border-transparent bg-slate-50 px-4 focus:bg-white focus:border-blue-500 transition-all font-bold text-sm">
                      <option value="">Select Domain</option>
                      {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Secret Password</Label>
                    <Input id="password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Strong password" className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Confirm Secret</Label>
                    <Input id="confirmPassword" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Verify password" className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 font-bold" />
                  </div>
                  <div className="flex items-center gap-3 pt-6 group cursor-pointer" onClick={() => setFormData({ ...formData, terms: !formData.terms })}>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.terms ? 'bg-blue-600 border-blue-600' : 'border-slate-200'}`}>
                      {formData.terms && <ChevronRight size={14} className="text-white rotate-90" />}
                    </div>
                    <Label htmlFor="terms" className="text-xs text-slate-500 font-medium italic cursor-pointer">
                      I agree to the <span className="text-blue-600 font-black hover:underline">Terms of Service</span> and <span className="text-blue-600 font-black hover:underline">Privacy Policy</span>
                    </Label>
                  </div>
                </div>
              )}
            </motion.form>
          </AnimatePresence>

          {/* Actions */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between pt-8 border-t border-slate-50">
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={prevStep}
                className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 rounded-2xl text-slate-400 font-black uppercase tracking-wide text-xs sm:text-sm hover:text-slate-900 transition-colors flex items-center justify-center"
              >
                <ChevronLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                onClick={nextStep}
                className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-wide text-xs sm:text-sm shadow-xl shadow-slate-900/10 flex items-center justify-center"
              >
                Next Step
                <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="h-14 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">
                {loading ? 'Processing...' : 'Complete Registration'} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>

  );
}
