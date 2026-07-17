import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import { db } from '../../lib/firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { motion } from 'motion/react';
import {
  FileText,
  Award,
  BarChart2,
  FileCheck,
  Edit3,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  Calendar,
  Sparkles
} from 'lucide-react';
import { generateCertificate } from './generateCertificate';
import { generateAttendanceReport, AttendanceEntry } from './generateAttendanceReport';
import { generateTestReport } from './generateTestReport';
import { COURSE_VIDEO_DAY_LIMIT } from '../../lib/constants';

export default function MainDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [learningProgress, setLearningProgress] = useState(0);
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntry[]>([]);
  const [testSubmission, setTestSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    if (!user || !profile?.internshipDomain) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const course = profile.internshipDomain;

        // 1. Fetch daily videos in course
        const videosQuery = query(
          collection(db, 'dailyVideos'),
          where('course', '==', course)
        );
        const videosSnapshot = await getDocs(videosQuery);
        const uploadedDays = new Set(
          videosSnapshot.docs
            .map((videoDoc) => String(videoDoc.data().day || '').trim())
            .filter(Boolean)
        );

        // 2. Fetch student attendance
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('userId', '==', user.uid),
          where('course', '==', course)
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
        const entries = attendanceSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as AttendanceEntry));
        setAttendanceEntries(entries);

        // Calculate progress percentage
        if (uploadedDays.size > 0) {
          const completedDays = new Set<string>();
          
          // Get unique completed days from video watch progress
          const progressRef = doc(db, 'userVideoProgress', `${user.uid}-${course}`);
          const progressSnapshot = await getDoc(progressRef);

          if (progressSnapshot.exists()) {
            const completedVideos = progressSnapshot.data().completedVideos || {};
            Object.entries(completedVideos).forEach(([day, completed]) => {
              const normalizedDay = String(day).trim();
              if (completed && uploadedDays.has(normalizedDay)) {
                completedDays.add(normalizedDay);
              }
            });
          }

          // Add completed days from attendance
          entries.forEach(entry => {
            const normalizedDay = String(entry.day || '').trim();
            if (uploadedDays.has(normalizedDay)) {
              completedDays.add(normalizedDay);
            }
          });

          const calculatedProgress = Math.round((completedDays.size / uploadedDays.size) * 100);
          setLearningProgress(calculatedProgress);
          setTotalHours(completedDays.size * 4); // Assume 4 hours per class/day watched
        } else {
          setLearningProgress(profile.progress || 0);
          setTotalHours(entries.length * 4);
        }

        // 3. Fetch test submissions
        const subRef = doc(db, 'testSubmissions', `${user.uid}-${course}`);
        const subSnap = await getDoc(subRef);
        if (subSnap.exists()) {
          setTestSubmission(subSnap.data());
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, profile]);

  const handleDownloadCertificate = async () => {
    if (!user?.uid || !profile) return;
    try {
      await generateCertificate(profile, user.uid);
    } catch (error) {
      console.error(error);
      alert('Error downloading certificate');
    }
  };

  const handleDownloadAttendance = async () => {
    if (!profile) return;
    try {
      // Fetch attendance videos if needed, pass empty array for fallback mapping
      await generateAttendanceReport(profile, attendanceEntries, []);
    } catch (error) {
      console.error(error);
      alert('Error downloading attendance report');
    }
  };

  const handleDownloadMarksheet = async () => {
    if (!testSubmission || !profile?.internshipDomain) {
      alert('Please complete the assessment test under the Learning tab to unlock the Marksheet.');
      return;
    }
    try {
      const testRef = doc(db, 'courseTests', profile.internshipDomain);
      const testSnap = await getDoc(testRef);
      const questions = testSnap.exists() ? (testSnap.data().questions || []) : [];
      await generateTestReport(profile, testSubmission, questions);
    } catch (error) {
      console.error(error);
      alert('Error generating marksheet');
    }
  };

  // Check if course requirements met
  const isAssessmentCompleted = !!testSubmission;
  const isCertificateReady = learningProgress >= 100 && isAssessmentCompleted;
  const isReportReady = learningProgress >= 90;

  // Checklist states
  const steps = [
    { label: 'Registration', completed: true, desc: 'Details verified' },
    { label: 'Payment', completed: !!profile?.hasPaid, desc: profile?.hasPaid ? 'Paid' : 'Pending' },
    { label: 'Assessment', completed: isAssessmentCompleted, desc: isAssessmentCompleted ? 'Test Completed' : 'Pending Test' },
    { label: 'Certificate', completed: isCertificateReady, desc: isCertificateReady ? 'Ready for Download' : 'Not Issued' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Upper Banner Greeting */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white p-6 sm:p-8 md:p-10 shadow-lg border border-white/10">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs font-semibold">
            <span>🎓</span>
            <span>Student Workspace Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Welcome back, {profile?.fullName || 'Learner'}! 👋
          </h1>
          <p className="text-blue-150 text-sm sm:text-base font-medium max-w-2xl">
            Track your internship progress, access live classes, download assignments, and manage your certificates in one place.
          </p>
        </div>
        <div className="absolute right-6 bottom-6 hidden lg:block opacity-10 rotate-12 pointer-events-none">
          <Award size={200} />
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Progress Steps Checklist */}
      <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span>🎯</span> Internship Milestone Progress
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => (
            <div key={step.label} className="flex items-start gap-4 relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                step.completed ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}>
                {step.completed ? '✓' : idx + 1}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{step.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Offer Letter */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 hover:border-blue-500/30 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-350 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4 font-bold">
              📄
            </div>
            <h3 className="font-extrabold text-gray-900 text-lg uppercase tracking-tight">Offer Letter</h3>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              Your official internship onboarding letter including domain, schedule, and guidelines.
            </p>
          </div>
          <div className="mt-6">
            <button
              onClick={() => navigate('/dashboard/offer-letter')}
              className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition active:scale-[0.98]"
            >
              View & Download
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* 2. Certificate */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 hover:border-blue-500/30 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-350 flex flex-col justify-between">
          <div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 font-bold ${
              isCertificateReady ? 'bg-green-50 text-green-600' : 'bg-gray-150 text-gray-400'
            }`}>
              🏆
            </div>
            <h3 className="font-extrabold text-gray-900 text-lg uppercase tracking-tight">Internship Certificate</h3>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              UGC-compliant, industry-recognized digital certificate validating your hours and achievements.
            </p>
          </div>
          <div className="mt-6">
            {isCertificateReady ? (
              <button
                onClick={handleDownloadCertificate}
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-xs font-bold text-white transition active:scale-[0.98]"
              >
                Download Certificate (PDF)
              </button>
            ) : (
              <button
                disabled
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-100 text-xs font-bold text-gray-400 cursor-not-allowed border border-gray-200"
              >
                Locked: Complete Course & Test
              </button>
            )}
          </div>
        </div>

        {/* 3. Marksheet / Department Certificate */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 hover:border-blue-500/30 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-350 flex flex-col justify-between">
          <div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 font-bold ${
              isAssessmentCompleted ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-150 text-gray-400'
            }`}>
              📊
            </div>
            <h3 className="font-extrabold text-gray-900 text-lg uppercase tracking-tight">Graded Marksheet</h3>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              Detailed breakdown of percentage, module scores, and final grading evaluations.
            </p>
          </div>
          <div className="mt-6">
            {isAssessmentCompleted ? (
              <button
                onClick={handleDownloadMarksheet}
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition active:scale-[0.98]"
              >
                Download Marksheet (PDF)
              </button>
            ) : (
              <button
                disabled
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-100 text-xs font-bold text-gray-400 cursor-not-allowed border border-gray-200"
              >
                Locked: Requires Assessment
              </button>
            )}
          </div>
        </div>

        {/* 4. Internship Report */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 hover:border-blue-500/30 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-355 flex flex-col justify-between">
          <div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 font-bold ${
              isReportReady ? 'bg-violet-50 text-violet-600' : 'bg-gray-150 text-gray-400'
            }`}>
              📋
            </div>
            <h3 className="font-extrabold text-gray-900 text-lg uppercase tracking-tight">Internship Report</h3>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              Download your comprehensive 20+ page structured report documenting your learning.
            </p>
          </div>
          <div className="mt-6">
            {isReportReady ? (
              <button
                onClick={() => navigate('/dashboard/assignments')}
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-750 text-xs font-bold text-white transition active:scale-[0.98]"
              >
                Report Workspace
              </button>
            ) : (
              <button
                disabled
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-100 text-xs font-bold text-gray-400 cursor-not-allowed border border-gray-200"
              >
                Locked: Watch 90% Classes
              </button>
            )}
          </div>
        </div>

        {/* 5. Feedback Form */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 hover:border-blue-500/30 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-355 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center text-2xl mb-4 font-bold">
              ✍️
            </div>
            <h3 className="font-extrabold text-gray-900 text-lg uppercase tracking-tight">Feedback Form</h3>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              Share your internship feedback report with the university coordinators.
            </p>
          </div>
          <div className="mt-6">
            <button
              onClick={() => navigate('/dashboard/reports')}
              className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white transition active:scale-[0.98]"
            >
              Fill Feedback
            </button>
          </div>
        </div>

        {/* 6. Attendance Slip download */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 hover:border-blue-500/30 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-355 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-2xl mb-4 font-bold">
              📅
            </div>
            <h3 className="font-extrabold text-gray-900 text-lg uppercase tracking-tight">Attendance Record</h3>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              Download your verified PDF logs for NEP / University presentation dossiers.
            </p>
          </div>
          <div className="mt-6">
            <button
              onClick={handleDownloadAttendance}
              className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition active:scale-[0.98]"
            >
              Download PDF Report
            </button>
          </div>
        </div>

      </div>

      {/* WhatsApp banner channel */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-extrabold text-lg flex items-center justify-center sm:justify-start gap-2">
            <span>📱</span> Join WhatsApp Student Channel
          </h4>
          <p className="text-emerald-50 text-sm font-medium">
            Stay updated instantly about evaluations, assignments, class schedules, and final evaluations.
          </p>
        </div>
        <a
          href="https://whatsapp.com/channel/0029VbBRjHAIXnlwKn7IOK3e"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-emerald-700 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition shadow-md active:scale-95 flex-shrink-0 text-sm flex items-center gap-2"
        >
          <Send size={15} />
          Join Now
        </a>
      </div>

      {/* Attendance Table */}
      <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>📘</span> Recorded Attendance Record
          </h3>
          <div className="flex gap-4 text-xs font-semibold text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
            <div>
              Total: <span className="font-extrabold text-slate-900">{COURSE_VIDEO_DAY_LIMIT} Days</span>
            </div>
            <div>
              Attended: <span className="font-extrabold text-green-600">{attendanceEntries.length} Days</span>
            </div>
            <div>
              Percentage: <span className="font-extrabold text-blue-600">{
                Math.round((attendanceEntries.length / COURSE_VIDEO_DAY_LIMIT) * 100) || 0
              }%</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500 font-medium text-sm">
            Loading attendance records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 text-xs font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Day</th>
                  <th className="py-3 px-4">Session Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Class Topic</th>
                  <th className="py-3 px-4 text-right">Credit Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {Array.from({ length: COURSE_VIDEO_DAY_LIMIT }, (_, idx) => {
                  const dayNum = idx + 1;
                  const entry = attendanceEntries.find(e => e.day === dayNum);
                  
                  let dateStr = '-';
                  let status = 'Absent';
                  let topic = 'Pending watch';
                  let hours = 0;

                  if (entry) {
                    dateStr = entry.watchedAt 
                      ? new Date(entry.watchedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : 'Completed';
                    status = 'Present';
                    topic = entry.videoTitle || 'Class Session';
                    hours = 6; // Reference site completes 6 hours per session
                  }

                  return (
                    <tr key={dayNum} className="hover:bg-gray-50/50 transition-colors text-sm text-gray-700">
                      <td className="py-3.5 px-4 font-bold text-gray-900">Day {dayNum}</td>
                      <td className="py-3.5 px-4 font-medium text-gray-500">{dateStr}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          status === 'Present' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status === 'Present' ? 'bg-green-500' : 'bg-red-500'}`} />
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 truncate max-w-xs font-semibold text-gray-600">{topic}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">{hours} Hrs</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
