import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  LogOut,
  Mail,
  Phone,
  Search,
  Users,
  Download,
  Calendar,
  BookOpen,
  Filter,
  ArrowUpDown,
  GraduationCap,
  Sparkles,
  BarChart3,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../components/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { UserProfile } from '../types';

interface ImportedStudent {
  id: string;
  fullName: string;
  parentName: string;
  contactNumber: string;
  email: string;
  gender: string;
  college: string;
  university: string;
  course: string;
  semester: string;
  universityRoll: string;
  industrialRegNo: string;
  paymentStatus: string;
  importedAt?: string;
}

export default function CollegeDashboard() {
  const { collegeProfile } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [importedStudents, setImportedStudents] = useState<ImportedStudent[]>([]);
  const [collegePrice, setCollegePrice] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'registered' | 'pending_reg'>('registered');

  useEffect(() => {
    const fetchCollegeData = async () => {
      if (!collegeProfile?.collegeName) return;

      setLoading(true);
      try {
        // 1. Fetch Registered Students
        const studentsQuery = query(
          collection(db, 'users'),
          where('college', '==', collegeProfile.collegeName)
        );
        const snapshot = await getDocs(studentsQuery);
        const data = snapshot.docs
          .map((doc) => ({ uid: doc.id, ...doc.data() } as UserProfile))
          .sort((a, b) => (b.registrationDate || '').localeCompare(a.registrationDate || ''));
        setStudents(data);

        // 2. Fetch Imported Students (Pre-registration)
        const importedQuery = query(
          collection(db, 'importedStudents'),
          where('college', '==', collegeProfile.collegeName)
        );
        const importedSnapshot = await getDocs(importedQuery);
        const importedData = importedSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as ImportedStudent)
        );
        setImportedStudents(importedData);

        // 3. Fetch College Price Settings
        const collegesQuery = query(
          collection(db, 'colleges'),
          where('name', '==', collegeProfile.collegeName)
        );
        const collegeSnap = await getDocs(collegesQuery);
        if (!collegeSnap.empty) {
          setCollegePrice(collegeSnap.docs[0].data().price || 1000);
        }
      } catch (error) {
        console.error('Error fetching college dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeData();
  }, [collegeProfile?.collegeName]);

  const isPaymentComplete = (student: UserProfile) =>
    student.paymentStatus !== 'rejected' &&
    Boolean(student.isPaid || student.hasPaid || student.paymentStatus === 'success');

  const paidCount = students.filter(isPaymentComplete).length;
  
  // Total pending: All imported students minus those who have paid successfully
  const pendingCount = Math.max(0, importedStudents.length - paidCount);

  // Total received revenue
  const totalReceivedAmount = paidCount * collegePrice;

  // Gender counts from combined sources for completeness
  const maleCount = useMemo(() => {
    const registeredMale = students.filter((s) => s.gender?.toLowerCase() === 'male').length;
    const unregisteredImportedMale = importedStudents.filter(
      (imp) =>
        imp.gender?.toLowerCase() === 'male' &&
        !students.some((s) => s.universityRoll === imp.universityRoll)
    ).length;
    return registeredMale + unregisteredImportedMale;
  }, [students, importedStudents]);

  const femaleCount = useMemo(() => {
    const registeredFemale = students.filter((s) => s.gender?.toLowerCase() === 'female').length;
    const unregisteredImportedFemale = importedStudents.filter(
      (imp) =>
        imp.gender?.toLowerCase() === 'female' &&
        !students.some((s) => s.universityRoll === imp.universityRoll)
    ).length;
    return registeredFemale + unregisteredImportedFemale;
  }, [students, importedStudents]);

  // Unregistered imported students list
  const unregisteredStudents = useMemo(() => {
    return importedStudents.filter(
      (imp) => !students.some((s) => s.universityRoll === imp.universityRoll)
    );
  }, [students, importedStudents]);

  // Combined search filtering
  const filteredStudents = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return students;

    return students.filter((student) =>
      [
        student.fullName,
        student.email,
        student.contactNumber,
        student.universityRoll,
        student.internshipDomain,
        student.gender,
      ].join(' ').toLowerCase().includes(value)
    );
  }, [search, students]);

  const filteredUnregistered = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return unregisteredStudents;

    return unregisteredStudents.filter((student) =>
      [
        student.fullName,
        student.email,
        student.contactNumber,
        student.universityRoll,
        student.course,
        student.gender,
      ].join(' ').toLowerCase().includes(value)
    );
  }, [search, unregisteredStudents]);

  // Course wise report calculations
  const courseReport = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      const course = s.internshipDomain || 'Unspecified';
      counts[course] = (counts[course] || 0) + 1;
    });
    unregisteredStudents.forEach((s) => {
      const course = s.course || 'Unspecified';
      counts[course] = (counts[course] || 0) + 1;
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
    })).sort((a, b) => b.count - a.count);
  }, [students, unregisteredStudents]);

  // Semester wise report calculations
  const semesterReport = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      const sem = s.semester || 'Unspecified';
      counts[sem] = (counts[sem] || 0) + 1;
    });
    unregisteredStudents.forEach((s) => {
      const sem = s.semester || 'Unspecified';
      counts[sem] = (counts[sem] || 0) + 1;
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
    })).sort((a, b) => b.count - a.count);
  }, [students, unregisteredStudents]);

  // Date-wise registration counts timeline
  const dateWiseReport = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      if (s.registrationDate) {
        const dateStr = new Date(s.registrationDate).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        counts[dateStr] = (counts[dateStr] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .slice(0, 7); // Show latest 7 days
  }, [students]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const exportCSV = (type: 'registered' | 'pending') => {
    const targetData = type === 'registered' ? filteredStudents : filteredUnregistered;
    if (targetData.length === 0) {
      alert("No data available to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (type === 'registered') {
      csvContent += "Roll Number,Student Name,Father Name,Email,Mobile Number,Gender,Course Domain,Semester,Payment Status,Registration Date\n";
      targetData.forEach((student: any) => {
        const row = [
          `"${student.universityRoll || ''}"`,
          `"${student.fullName || ''}"`,
          `"${student.parentName || ''}"`,
          `"${student.email || ''}"`,
          `"${student.contactNumber || ''}"`,
          `"${student.gender || ''}"`,
          `"${student.internshipDomain || ''}"`,
          `"${student.semester || ''}"`,
          `"${isPaymentComplete(student) ? 'Success' : 'Pending'}"`,
          `"${student.registrationDate ? new Date(student.registrationDate).toLocaleDateString() : ''}"`
        ].join(",");
        csvContent += row + "\n";
      });
    } else {
      csvContent += "Roll Number,Student Name,Father Name,Email,Mobile Number,Gender,Course Domain,Semester,Industrial Reg Number\n";
      targetData.forEach((student: any) => {
        const row = [
          `"${student.universityRoll || ''}"`,
          `"${student.fullName || ''}"`,
          `"${student.parentName || ''}"`,
          `"${student.email || ''}"`,
          `"${student.contactNumber || ''}"`,
          `"${student.gender || ''}"`,
          `"${student.course || ''}"`,
          `"${student.semester || ''}"`,
          `"${student.industrialRegNo || ''}"`
        ].join(",");
        csvContent += row + "\n";
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `college_${type}_students_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 select-none font-sans text-left">
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-4 ring-indigo-50/50">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight sm:text-xl gradient-text">{collegeProfile?.collegeName || 'College Dashboard'}</h1>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Teacher & Coordinator Console</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-100">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Fee Rate: ₹{collegePrice}
            </span>
            <Button onClick={handleLogout} className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 shadow-md transition active:scale-98 cursor-pointer">
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        
        {/* STATS ANALYTICS GRID */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="student-card p-6 bg-white/80 border border-slate-100/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-455">
              <span className="text-[11px] font-black uppercase tracking-widest">Total Registered</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Users size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{students.length}</h3>
              <p className="text-[10px] text-slate-450 font-bold mt-1">Students completed account creation</p>
            </div>
          </div>

          <div className="student-card p-6 bg-white/80 border border-emerald-100/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-455">Paid Students</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{paidCount}</h3>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">Payments capturing success</p>
            </div>
          </div>

          <div className="student-card p-6 bg-white/80 border border-amber-100/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-600">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-455">Pending Payments</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Clock size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{pendingCount}</h3>
              <p className="text-[10px] text-amber-600 font-bold mt-1">Students yet to complete fee payment</p>
            </div>
          </div>

          <div className="student-card p-6 bg-white/80 border border-blue-100/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-blue-600">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-455">Received Revenue</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">₹{totalReceivedAmount.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] text-blue-600 font-bold mt-1">Paid Accounts × Fee Rate</p>
            </div>
          </div>
        </section>

        {/* ANALYTICS CHARTS & REPORTS SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* GENDER & REGISTRATION TRENDS */}
          <div className="student-card p-6 bg-white/80 border border-slate-100/50 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="text-indigo-500 size-4" />
                Gender Demographics
              </h3>
              <p className="text-[10px] font-bold text-slate-400">Total imported and registered students</p>
            </div>

            <div className="space-y-4">
              {/* Male Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-black text-slate-650">
                  <span>Male Students</span>
                  <span>{maleCount}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(maleCount / ((maleCount + femaleCount) || 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Female Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-black text-slate-650">
                  <span>Female Students</span>
                  <span>{femaleCount}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(femaleCount / ((maleCount + femaleCount) || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <Calendar className="text-indigo-500 size-4" />
                Registration Velocity (Latest)
              </h3>
              {dateWiseReport.length === 0 ? (
                <p className="text-[10px] font-bold text-slate-400 text-center py-4">No registration timeline records</p>
              ) : (
                <div className="space-y-2">
                  {dateWiseReport.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-bold bg-slate-50/50 p-2 rounded-lg border border-slate-100/30">
                      <span className="text-slate-600">{item.date}</span>
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black text-[10px]">{item.count} Registered</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* COURSE-WISE DISTRIBUTION REPORT */}
          <div className="student-card p-6 bg-white/80 border border-slate-100/50 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="text-indigo-500 size-4" />
                Course Domain Report
              </h3>
              <p className="text-[10px] font-bold text-slate-400">Student enrollment distribution across training domains</p>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {courseReport.map((course) => (
                <div key={course.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-black text-slate-650">
                    <span className="truncate max-w-[190px]">{course.name}</span>
                    <span>{course.count} ({course.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${course.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEMESTER-WISE REPORT */}
          <div className="student-card p-6 bg-white/80 border border-slate-100/50 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="text-indigo-500 size-4" />
                Semester-wise Report
              </h3>
              <p className="text-[10px] font-bold text-slate-400">Class breakdown across academic semesters</p>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {semesterReport.map((sem) => (
                <div key={sem.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-black text-slate-650">
                    <span>{sem.name}</span>
                    <span>{sem.count} ({sem.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${sem.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* STUDENT DIRECTORY CARD */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-md shadow-sm">
          {/* Toolbar and filter headers */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between bg-white/40">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="text-indigo-500 size-5" />
                College Student Directories
              </h2>
              <p className="text-[11px] font-semibold text-slate-500">
                {activeTab === 'registered' 
                  ? `Showing ${filteredStudents.length} of ${students.length} registered students`
                  : `Showing ${filteredUnregistered.length} of ${unregisteredStudents.length} pending registration students`
                }
              </p>
            </div>
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search students..."
                  className="h-11 rounded-2xl pl-10 text-xs font-semibold bg-white border border-slate-200"
                />
              </div>
              <Button
                onClick={() => exportCSV(activeTab)}
                className="w-full sm:w-auto h-11 px-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-indigo-150/40"
              >
                <Download size={14} />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Directory tabs */}
          <div className="flex border-b border-slate-100 px-5 bg-slate-50/20">
            <button
              onClick={() => { setActiveTab('registered'); setSearch(''); }}
              className={`py-3.5 px-4 font-black text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'registered'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-450 hover:text-slate-700'
              }`}
            >
              <UserCheck size={14} />
              Registered Students ({students.length})
            </button>
            <button
              onClick={() => { setActiveTab('pending_reg'); setSearch(''); }}
              className={`py-3.5 px-4 font-black text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'pending_reg'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-450 hover:text-slate-700'
              }`}
            >
              <Clock size={14} />
              Pending Registration ({unregisteredStudents.length})
            </button>
          </div>

          {/* Table Container */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Syncing Student Directories...</span>
            </div>
          ) : (activeTab === 'registered' ? filteredStudents : filteredUnregistered).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-450 font-bold text-sm bg-white">
              No students found in this category.
            </div>
          ) : (
            <div className="overflow-x-auto bg-white">
              <table className="w-full min-w-[950px] table-auto text-xs text-left">
                <thead className="bg-slate-50/70 border-b border-slate-100">
                  <tr>
                    <th className="p-4 font-black uppercase tracking-wider text-slate-500">Student Details</th>
                    <th className="p-4 font-black uppercase tracking-wider text-slate-500">Contact Address</th>
                    <th className="p-4 font-black uppercase tracking-wider text-slate-500">Gender</th>
                    <th className="p-4 font-black uppercase tracking-wider text-slate-500">University Roll</th>
                    <th className="p-4 font-black uppercase tracking-wider text-slate-500">Course Track</th>
                    {activeTab === 'registered' ? (
                      <th className="p-4 font-black uppercase tracking-wider text-slate-500">Payment Status</th>
                    ) : (
                      <th className="p-4 font-black uppercase tracking-wider text-slate-500">Undertaking / Key</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeTab === 'registered' ? (
                    filteredStudents.map((student) => {
                      const paymentComplete = isPaymentComplete(student);
                      return (
                        <tr key={student.uid} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <div className="font-black text-slate-900 text-sm">{student.fullName}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{student.department || student.subject || 'N/A'}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                              <Mail size={12} className="text-slate-400" />
                              {student.email}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-slate-700 font-semibold">
                              <Phone size={12} className="text-slate-400" />
                              {student.contactNumber || '-'}
                            </div>
                          </td>
                          <td className="p-4 text-slate-700 font-bold capitalize">{student.gender || '-'}</td>
                          <td className="p-4 text-slate-900 font-black tracking-wide">{student.universityRoll || '-'}</td>
                          <td className="p-4">
                            <div className="font-black text-indigo-600">{student.internshipDomain || '-'}</div>
                            <div className="text-[10px] font-bold text-slate-400 mt-0.5">{student.semester}</div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border ${
                              paymentComplete
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              {paymentComplete ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                              {paymentComplete ? 'Paid Success' : 'Unpaid / Pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    filteredUnregistered.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-black text-slate-900 text-sm">{student.fullName}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">S/o: {student.parentName || 'N/A'}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                            <Mail size={12} className="text-slate-400" />
                            {student.email}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-slate-700 font-semibold">
                            <Phone size={12} className="text-slate-400" />
                            {student.contactNumber || '-'}
                          </div>
                        </td>
                        <td className="p-4 text-slate-700 font-bold capitalize">{student.gender || '-'}</td>
                        <td className="p-4 text-slate-900 font-black tracking-wide">{student.universityRoll || '-'}</td>
                        <td className="p-4">
                          <div className="font-black text-indigo-600">{student.course || '-'}</div>
                          <div className="text-[10px] font-bold text-slate-400 mt-0.5">{student.semester}</div>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-indigo-600 font-bold bg-indigo-50/80 px-2.5 py-1.5 rounded-lg border border-indigo-100/50">
                            {student.industrialRegNo}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
