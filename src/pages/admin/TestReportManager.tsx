import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../components/AuthContext';
import { INTERNSHIP_DOMAINS } from '../../lib/constants';
import { generateTestReport, QuizSubmission, QuizQuestion } from '../dashboard/generateTestReport';
import {
  FileCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Layers,
  ShieldCheck,
  X,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Download,
  Eye,
  Trash2,
  Award,
  Filter,
  GraduationCap,
  XCircle,
  HelpCircle,
  TrendingUp,
  Percent
} from 'lucide-react';

interface TestSubmissionData {
  id: string;
  userId: string;
  studentName: string;
  email: string;
  course: string;
  answers?: Record<string, number>;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  scorePercentage: number;
  submittedAt: string;
}

interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  college?: string;
  universityRoll?: string;
  department?: string;
  semester?: string;
  internshipDomain: string;
}

interface TestReportManagerProps {
  users?: UserProfile[];
}

export default function TestReportManager({ users = [] }: TestReportManagerProps) {
  const { user } = useAuth();

  // Data states
  const [submissions, setSubmissions] = useState<TestSubmissionData[]>([]);
  const [courseTestsMap, setCourseTestsMap] = useState<Record<string, QuizQuestion[]>>({});
  const [loading, setLoading] = useState(true);

  // Filter & Pagination states (Default 25)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 'all' | 'passed' | 'failed'
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(25);

  // Action Menu state (3-dots dropdown)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Score breakdown modal state
  const [selectedSubmission, setSelectedSubmission] = useState<{
    sub: TestSubmissionData;
    userProfile?: UserProfile;
  } | null>(null);

  // Feedback message
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Close 3-dots dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.action-menu-container')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, courseFilter, statusFilter, gradeFilter, itemsPerPage]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch test submissions from Firestore 'testSubmissions'
      const subRef = collection(db, 'testSubmissions');
      const subSnap = await getDocs(subRef);
      const list: TestSubmissionData[] = subSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<TestSubmissionData, 'id'>)
      }));
      list.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
      setSubmissions(list);

      // 2. Fetch course test questions for PDF export
      try {
        const testsRef = collection(db, 'courseTests');
        const testsSnap = await getDocs(testsRef);
        const map: Record<string, QuizQuestion[]> = {};
        testsSnap.docs.forEach((d) => {
          map[d.id] = (d.data().questions || []) as QuizQuestion[];
        });
        setCourseTestsMap(map);
      } catch (err) {
        console.warn('Could not fetch course tests:', err);
      }
    } catch (error) {
      console.error('Error loading test reports:', error);
      setMessage({ type: 'error', text: 'Failed to load student test reports.' });
    } finally {
      setLoading(false);
    }
  };

  // Combine course options
  const allCourses = Array.from(
    new Set([
      ...INTERNSHIP_DOMAINS,
      ...submissions.map((s) => s.course).filter(Boolean)
    ])
  ).sort();

  // ONLY show actual test submissions from Firestore (New/submitted students only)
  const submittedTestReports = submissions.map((sub) => {
    const userProfile = users.find(
      (u) =>
        u.uid === sub.userId ||
        (u.email && sub.email && u.email.toLowerCase().trim() === sub.email.toLowerCase().trim())
    );
    return {
      submission: sub,
      userProfile: userProfile || {
        uid: sub.userId,
        fullName: sub.studentName || 'Student',
        email: sub.email || '',
        internshipDomain: sub.course || ''
      },
      id: sub.id
    };
  });

  // Calculate grade for a percentage score
  const getGradeInfo = (score: number) => {
    if (score >= 90) return { label: 'Grade A+', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (score >= 80) return { label: 'Grade A', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 70) return { label: 'Grade B+', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (score >= 60) return { label: 'Grade B', color: 'bg-sky-50 text-sky-700 border-sky-200' };
    if (score >= 50) return { label: 'Grade C+', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    if (score >= 40) return { label: 'Grade C', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (score >= 33) return { label: 'Grade D', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' };
    return { label: 'Grade F', color: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  // Helper for domain badge styling
  const getDomainBadgeStyle = (domainName?: string) => {
    if (!domainName) return { bg: 'bg-blue-50 text-blue-600 border-blue-100', icon: Layers };
    const d = domainName.toLowerCase();
    if (d.includes('teacher')) return { bg: 'bg-blue-50 text-blue-600 border-blue-100', icon: BookOpen };
    if (d.includes('digital') || d.includes('personality')) return { bg: 'bg-purple-50 text-purple-600 border-purple-100', icon: Sparkles };
    if (d.includes('graphics') || d.includes('content') || d.includes('media')) return { bg: 'bg-orange-50 text-orange-600 border-orange-100', icon: Layers };
    if (d.includes('entrepreneur')) return { bg: 'bg-cyan-50 text-cyan-600 border-cyan-100', icon: ShieldCheck };
    if (d.includes('web') || d.includes('software') || d.includes('tech')) return { bg: 'bg-sky-50 text-sky-600 border-sky-100', icon: FileCheck };
    if (d.includes('security') || d.includes('cyber')) return { bg: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: ShieldCheck };
    if (d.includes('financial') || d.includes('business')) return { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2 };
    if (d.includes('health') || d.includes('medical')) return { bg: 'bg-rose-50 text-rose-600 border-rose-100', icon: Sparkles };
    return { bg: 'bg-blue-50 text-blue-600 border-blue-100', icon: Layers };
  };

  // Compact Pagination Range Generator (Prevents horizontal overflow)
  const getPaginationRange = (curr: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const range: (number | string)[] = [];
    range.push(1);
    if (curr > 3) range.push('...');
    const start = Math.max(2, curr - 1);
    const end = Math.min(total - 1, curr + 1);
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    if (curr < total - 2) range.push('...');
    if (total > 1) range.push(total);
    return range;
  };

  // Export PDF Marksheet handler
  const handleExportPDF = async (studentProfile: UserProfile, sub: TestSubmissionData) => {
    try {
      setMessage(null);
      const questions = courseTestsMap[sub.course] || [];
      const quizSub: QuizSubmission = {
        userId: sub.userId || studentProfile.uid,
        studentName: sub.studentName || studentProfile.fullName,
        email: sub.email || studentProfile.email,
        course: sub.course || studentProfile.internshipDomain,
        answers: sub.answers || {},
        correctCount: sub.correctCount || 0,
        wrongCount: sub.wrongCount || 0,
        totalQuestions: sub.totalQuestions || 10,
        scorePercentage: sub.scorePercentage || 0,
        submittedAt: sub.submittedAt || new Date().toISOString()
      };

      await generateTestReport(studentProfile, quizSub, questions);
    } catch (error: any) {
      console.error('Error generating PDF mark sheet:', error);
      setMessage({ type: 'error', text: 'Failed to export test marksheet PDF.' });
    }
  };

  // Delete/Reset Submission Handler
  const handleDeleteSubmission = async (subId: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to reset/delete the test submission for "${studentName}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'testSubmissions', subId));
      setMessage({ type: 'success', text: `Test submission for "${studentName}" has been reset.` });
      setSubmissions((prev) => prev.filter((s) => s.id !== subId));
    } catch (error) {
      console.error('Error deleting submission:', error);
      setMessage({ type: 'error', text: 'Failed to reset test submission.' });
    }
  };

  // Filtering logic on submitted test reports
  const filteredReports = submittedTestReports.filter((item) => {
    const studentName = (item.userProfile.fullName || item.submission.studentName || '').toLowerCase();
    const email = (item.userProfile.email || item.submission.email || '').toLowerCase();
    const domain = (item.userProfile.internshipDomain || item.submission.course || '').toLowerCase();

    const matchesSearch =
      studentName.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase()) ||
      domain.includes(searchQuery.toLowerCase());

    const matchesCourse = !courseFilter || domain.trim() === courseFilter.toLowerCase().trim();

    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'passed') {
      matchesStatus = (item.submission.scorePercentage || 0) >= 33;
    } else if (statusFilter === 'failed') {
      matchesStatus = (item.submission.scorePercentage || 0) < 33;
    }

    // Grade filter
    let matchesGrade = true;
    if (gradeFilter !== 'all') {
      const score = item.submission.scorePercentage || 0;
      if (gradeFilter === 'a_plus') matchesGrade = score >= 90;
      else if (gradeFilter === 'a') matchesGrade = score >= 80 && score < 90;
      else if (gradeFilter === 'b_plus') matchesGrade = score >= 70 && score < 80;
      else if (gradeFilter === 'b') matchesGrade = score >= 60 && score < 70;
      else if (gradeFilter === 'below_60') matchesGrade = score < 60;
    }

    return matchesSearch && matchesCourse && matchesStatus && matchesGrade;
  });

  // Overall Stats
  const totalSubmissionsCount = submissions.length;
  const totalPassedCount = submissions.filter((s) => (s.scorePercentage || 0) >= 33).length;
  const passRatePercentage = totalSubmissionsCount > 0 ? Math.round((totalPassedCount / totalSubmissionsCount) * 100) : 0;
  const avgScore = totalSubmissionsCount > 0
    ? Math.round(submissions.reduce((acc, s) => acc + (s.scorePercentage || 0), 0) / totalSubmissionsCount)
    : 0;

  // Pagination Calculations (Default 25)
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const startIndex = filteredReports.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredReports.length);
  const currentReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider">
            ADMIN CONTROL CENTER
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
            Student Assessment Test Reports
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Real-time assessment test reports of students who have completed their tests.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchInitialData}
          disabled={loading}
          className="h-10 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : 'text-blue-600'} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileCheck size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">TEST SUBMISSIONS</p>
            <p className="text-2xl font-black text-slate-900">{totalSubmissionsCount}</p>
            <p className="text-[11px] font-medium text-slate-400">Total Completed Quizzes</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Award size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">PASSED STUDENTS</p>
            <p className="text-2xl font-black text-slate-900">{totalPassedCount}</p>
            <p className="text-[11px] font-medium text-slate-400">Scored ≥ 33%</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">PASS RATE</p>
            <p className="text-2xl font-black text-slate-900">{passRatePercentage}%</p>
            <p className="text-[11px] font-medium text-slate-400">Success Ratio</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Percent size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">AVERAGE SCORE</p>
            <p className="text-2xl font-black text-slate-900">{avgScore}%</p>
            <p className="text-[11px] font-medium text-slate-400">Batch Performance</p>
          </div>
        </div>
      </div>

      {/* ALERT MESSAGE */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-extrabold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
          <button type="button" onClick={() => setMessage(null)} className="cursor-pointer text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 3. TABLE CARD WITH FILTERS & COMPACT PAGINATION */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        {/* FILTERS & SEARCH ROW */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">Submitted Student Test Reports</h3>
            <p className="text-xs font-semibold text-slate-400">
              Showing {filteredReports.length} student test submission(s)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search student or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 transition-all"
              />
            </div>

            {/* Course Filter */}
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 transition-all cursor-pointer"
            >
              <option value="">All Course Domains</option>
              {allCourses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 transition-all cursor-pointer"
            >
              <option value="all">All Test Results</option>
              <option value="passed">✓ Passed (≥ 33%)</option>
              <option value="failed">✗ Failed (&lt; 33%)</option>
            </select>
          </div>
        </div>

        {/* RESULTS TABLE */}
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <FileCheck size={36} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-500">No test submissions found.</p>
            <p className="text-xs text-slate-400">Student test submissions will appear here in real time as students complete their quizzes.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto min-h-[320px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="py-3 px-4">STUDENT NAME & EMAIL</th>
                    <th className="py-3 px-4">COLLEGE / ROLL</th>
                    <th className="py-3 px-4">DOMAIN TRACK</th>
                    <th className="py-3 px-4">SCORE & GRADE</th>
                    <th className="py-3 px-4">RESULT STATUS</th>
                    <th className="py-3 px-4">SUBMITTED DATE</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                  {currentReports.map((item) => {
                    const student = item.userProfile;
                    const sub = item.submission;
                    const domain = sub.course || student.internshipDomain || 'General';
                    const badgeStyle = getDomainBadgeStyle(domain);
                    const BadgeIcon = badgeStyle.icon;

                    const score = sub.scorePercentage || 0;
                    const isPassed = score >= 33;
                    const gradeInfo = getGradeInfo(score);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-all">
                        {/* STUDENT NAME & EMAIL */}
                        <td className="py-4 px-4">
                          <div className="font-black text-slate-900 text-sm">{sub.studentName || student.fullName || 'Student'}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{sub.email || student.email || 'N/A'}</div>
                        </td>

                        {/* COLLEGE / ROLL */}
                        <td className="py-4 px-4">
                          <div className="text-xs text-slate-700 font-extrabold">{student.college || 'N/A'}</div>
                          {student.universityRoll && (
                            <div className="text-[10px] text-slate-400 font-medium">Roll: {student.universityRoll}</div>
                          )}
                        </td>

                        {/* DOMAIN TRACK */}
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border inline-flex items-center gap-1.5 tracking-wider ${badgeStyle.bg}`}>
                            <BadgeIcon size={12} />
                            {domain}
                          </span>
                        </td>

                        {/* SCORE & GRADE */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="text-sm font-black text-slate-900 flex items-center gap-1">
                              <span>{score}%</span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                ({sub.correctCount || 0}/{sub.totalQuestions || 10})
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase inline-block ${gradeInfo.color}`}>
                              {gradeInfo.label}
                            </span>
                          </div>
                        </td>

                        {/* RESULT STATUS */}
                        <td className="py-4 px-4">
                          {isPassed ? (
                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-emerald-100 inline-flex items-center gap-1.5 tracking-wider">
                              <CheckCircle2 size={12} />
                              PASSED
                            </span>
                          ) : (
                            <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-rose-100 inline-flex items-center gap-1.5 tracking-wider">
                              <XCircle size={12} />
                              FAILED
                            </span>
                          )}
                        </td>

                        {/* SUBMITTED DATE */}
                        <td className="py-4 px-4 text-slate-500 font-bold text-xs">
                          {sub.submittedAt
                            ? new Date(sub.submittedAt).toLocaleString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'N/A'}
                        </td>

                        {/* 3-DOTS ACTION MENU */}
                        <td className="py-4 px-4 text-right">
                          <div className="relative inline-block text-left action-menu-container">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === item.id ? null : item.id);
                              }}
                              className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-all border border-slate-200/60"
                              title="Actions Menu"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {openMenuId === item.id && (
                              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100 text-left">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleExportPDF(student, sub);
                                  }}
                                  className="w-full px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Download size={14} className="text-blue-600" />
                                  <span>Export Marksheet PDF</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setSelectedSubmission({ sub, userProfile: student });
                                  }}
                                  className="w-full px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Eye size={14} className="text-purple-600" />
                                  <span>View Score Breakdown</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleDeleteSubmission(sub.id, sub.studentName || student.fullName);
                                  }}
                                  className="w-full px-4 py-2.5 text-xs font-extrabold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Trash2 size={14} className="text-red-500" />
                                  <span>Reset Test Submission</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* COMPACT PAGINATION CONTROLS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs font-bold text-slate-500">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-800 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>entries</span>
                <span className="text-slate-400 font-semibold ml-2 hidden md:inline">
                  (Showing {startIndex} to {endIndex} of {filteredReports.length} test records)
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-slate-700 cursor-pointer font-extrabold"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                {getPaginationRange(currentPage, totalPages).map((pageItem, idx) => {
                  if (pageItem === '...') {
                    return (
                      <span key={`ellipsis-${idx}`} className="h-8 px-1.5 flex items-center justify-center text-xs font-bold text-slate-400">
                        ...
                      </span>
                    );
                  }
                  const pageNum = pageItem as number;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 rounded-lg text-xs font-black cursor-pointer transition-all ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-slate-700 cursor-pointer font-extrabold"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* SCORE BREAKDOWN MODAL DIALOG */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Assessment Score Breakdown</h3>
                  <p className="text-xs font-semibold text-slate-400">
                    {selectedSubmission.sub.studentName} ({selectedSubmission.sub.course})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-400">Score Percentage</span>
                <p className="text-2xl font-black text-slate-900">{selectedSubmission.sub.scorePercentage}%</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-black text-slate-400">Result Grade</span>
                <p className="text-2xl font-black text-blue-600">
                  {getGradeInfo(selectedSubmission.sub.scorePercentage).label}
                </p>
              </div>

              <div className="bg-emerald-50/60 p-4 rounded-2xl space-y-1 border border-emerald-100">
                <span className="text-[10px] uppercase font-black text-emerald-600">Correct Answers</span>
                <p className="text-xl font-black text-emerald-700">
                  {selectedSubmission.sub.correctCount} / {selectedSubmission.sub.totalQuestions}
                </p>
              </div>

              <div className="bg-rose-50/60 p-4 rounded-2xl space-y-1 border border-rose-100">
                <span className="text-[10px] uppercase font-black text-rose-600">Wrong Answers</span>
                <p className="text-xl font-black text-rose-700">{selectedSubmission.sub.wrongCount}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs font-medium text-slate-600">
              <div className="flex justify-between">
                <span>Student Email:</span>
                <strong className="text-slate-900">{selectedSubmission.sub.email}</strong>
              </div>
              <div className="flex justify-between">
                <span>College:</span>
                <strong className="text-slate-900">{selectedSubmission.userProfile?.college || 'N/A'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Submission Date:</span>
                <strong className="text-slate-900">
                  {new Date(selectedSubmission.sub.submittedAt).toLocaleString('en-GB')}
                </strong>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {selectedSubmission.userProfile && (
                <button
                  type="button"
                  onClick={() => {
                    handleExportPDF(selectedSubmission.userProfile!, selectedSubmission.sub);
                    setSelectedSubmission(null);
                  }}
                  className="h-11 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <Download size={15} />
                  <span>Export PDF Marksheet</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
