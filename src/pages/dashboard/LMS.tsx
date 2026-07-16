import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthContext';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, where, doc, getDoc, setDoc, updateDoc, } from 'firebase/firestore';
import { motion } from 'motion/react';
import {
  PlayCircle,
  FileText,
  FileVideo,
  Search,
  Filter,
  Download,
  BookOpenCheck,
  ChevronRight,
  ChevronLeft,
  MonitorPlay,
  Calendar,
  CheckCircle2,
  Lock,
  SearchCheck,
  X,
  ClipboardList
} from 'lucide-react';
import { generateCertificate } from './generateCertificate';
import { AttendanceEntry, generateAttendanceReport } from './generateAttendanceReport';
import { generateTestReport } from './generateTestReport';
import { COURSE_VIDEO_DAY_LIMIT } from '../../lib/constants';

interface VideoProgress {
  [day: number]: boolean;
}

export default function LMS() {
  const { profile, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [videoActive, setVideoActive] = useState(false);
  const [dailyVideos, setDailyVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoProgress, setVideoProgress] = useState<VideoProgress>({});
  const [currentDay, setCurrentDay] = useState(0);
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const [adminApproved, setAdminApproved] = useState(false);
  const [certificateNo, setCertificateNo] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntry[]>([]);
  const [attendanceVideo, setAttendanceVideo] = useState<any | null>(null);
  const [attendanceSaving, setAttendanceSaving] = useState(false);

  // Assessment (Test) States
  const [courseTest, setCourseTest] = useState<any>(null);
  const [testSubmission, setTestSubmission] = useState<any>(null);
  const [takingTest, setTakingTest] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittingTest, setSubmittingTest] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const fetchTestAndSubmission = async () => {
    if (!profile?.internshipDomain || !user?.uid) return;
    try {
      const testRef = doc(db, 'courseTests', profile.internshipDomain);
      const testSnap = await getDoc(testRef);
      if (testSnap.exists()) {
        setCourseTest(testSnap.data());
      } else {
        setCourseTest(null);
      }

      const submissionRef = doc(db, 'testSubmissions', `${user.uid}-${profile.internshipDomain}`);
      const submissionSnap = await getDoc(submissionRef);
      if (submissionSnap.exists()) {
        setTestSubmission(submissionSnap.data());
      } else {
        setTestSubmission(null);
      }
    } catch (error) {
      console.error('Error fetching test/submission:', error);
    }
  };

  const handleStartTest = () => {
    if (!courseTest || !courseTest.questions || courseTest.questions.length === 0) {
      alert('No test available for this course yet.');
      return;
    }
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setTakingTest(true);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitTest = async () => {
    if (!user || !profile || !courseTest) return;

    const unansweredCount = courseTest.questions.length - Object.keys(selectedAnswers).length;
    if (unansweredCount > 0) {
      if (!confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`)) {
        return;
      }
    }

    setSubmittingTest(true);
    try {
      let correctCount = 0;
      courseTest.questions.forEach((q: any) => {
        const selected = selectedAnswers[q.id];
        if (selected !== undefined && selected === q.correctOptionIndex) {
          correctCount++;
        }
      });

      const totalQuestions = courseTest.questions.length;
      const wrongCount = totalQuestions - correctCount;
      const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

      const submissionData = {
        userId: user.uid,
        studentName: profile.fullName || 'Student',
        email: profile.email || user.email || '',
        course: profile.internshipDomain,
        answers: selectedAnswers,
        correctCount,
        wrongCount,
        totalQuestions,
        scorePercentage,
        submittedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'testSubmissions', `${user.uid}-${profile.internshipDomain}`), submissionData);
      setTestSubmission(submissionData);
      setTakingTest(false);
      setShowReportModal(true);
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Error submitting test');
    } finally {
      setSubmittingTest(false);
    }
  };

  useEffect(() => {
    fetchDailyVideos();
    fetchVideoProgress();
    fetchAdminApproval();
    fetchAttendance();
    calculateCurrentDay();
    fetchTestAndSubmission();
  }, [profile, user]);

  useEffect(() => {
    // Re-check completion status after videos are loaded
    if (dailyVideos.length > 0) {
      const completedCount = getCompletedVideoDays(videoProgress, attendanceEntries).size;
      setIsCourseCompleted(completedCount === dailyVideos.length);
    }
  }, [dailyVideos, videoProgress, attendanceEntries]);

  const getUploadedVideoDays = () => new Set(
    dailyVideos
      .map((video) => String(video.day || '').trim())
      .filter(Boolean)
  );

  const getCompletedVideoDays = (
    progress: VideoProgress = videoProgress,
    attendance: AttendanceEntry[] = attendanceEntries
  ) => {
    const uploadedDays = getUploadedVideoDays();
    const completedDays = new Set<string>();

    Object.entries(progress).forEach(([day, completed]) => {
      const normalizedDay = String(day).trim();
      if (completed && uploadedDays.has(normalizedDay)) {
        completedDays.add(normalizedDay);
      }
    });

    attendance.forEach((entry) => {
      const normalizedDay = String(entry.day || '').trim();
      if (uploadedDays.has(normalizedDay)) {
        completedDays.add(normalizedDay);
      }
    });

    return completedDays;
  };

  const getProgressPercentage = (
    progress: VideoProgress = videoProgress,
    attendance: AttendanceEntry[] = attendanceEntries
  ) => {
    const uploadedCount = getUploadedVideoDays().size;
    if (uploadedCount === 0) return 0;

    return Math.round((getCompletedVideoDays(progress, attendance).size / uploadedCount) * 100);
  };

  const calculateCurrentDay = () => {
    console.log('Profile:', profile);
    console.log('Registration date from profile:', profile?.registrationDate);

    if (!profile?.registrationDate) {
      console.log('No registrationDate in profile, defaulting to Day 1');
      setCurrentDay(1);
      return;
    }

    // Fix single-digit day in date format (e.g., 2026-05-1T -> 2026-05-01T)
    let dateStr = profile.registrationDate;
    dateStr = dateStr.replace(/-(\d)T/g, '-0$1T');

    const registrationDate = new Date(dateStr);
    console.log('Fixed date string:', dateStr);
    console.log('Parsed registration date:', registrationDate);
    console.log('Is valid date:', !isNaN(registrationDate.getTime()));

    if (isNaN(registrationDate.getTime())) {
      console.log('Invalid registration date, defaulting to Day 1');
      setCurrentDay(1);
      return;
    }

    const today = new Date();
    const diffTime = Math.abs(today.getTime() - registrationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const calculatedDay = Math.min(diffDays, COURSE_VIDEO_DAY_LIMIT);
    console.log('Today:', today);
    console.log('Days difference:', diffDays);
    console.log('Calculated current day:', calculatedDay);
    setCurrentDay(calculatedDay);
  };

  const fetchDailyVideos = async () => {
    try {
      const videosRef = collection(db, 'dailyVideos');
      const userCourse = profile?.internshipDomain || '';
      console.log('Fetching videos for course:', userCourse);
      const q = query(videosRef, where('course', '==', userCourse), orderBy('day'));
      const snapshot = await getDocs(q);
      const videosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Fetched videos:', videosData);
      setDailyVideos(videosData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching daily videos:', error);
      setLoading(false);
    }
  };

  const fetchVideoProgress = async () => {
    if (!user) return;
    try {
      const progressRef = doc(db, 'userVideoProgress', `${user.uid}-${profile?.internshipDomain}`);
      const progressDoc = await getDoc(progressRef);
      if (progressDoc.exists()) {
        const progressData = progressDoc.data();
        setVideoProgress(progressData.completedVideos || {});

        // Check if all uploaded videos are completed
        const completedCount = getCompletedVideoDays(progressData.completedVideos || {}).size;
        setIsCourseCompleted(completedCount === dailyVideos.length && dailyVideos.length > 0);
      }
    } catch (error) {
      console.error('Error fetching video progress:', error);
    }
  };
  const fetchAdminApproval = async () => {
    if (!profile?.internshipDomain) return;

    try {
      const docRef = doc(
        db,
        "courseCompletion",
        profile.internshipDomain
      );

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setAdminApproved(
          docSnap.data().completed === true
        );
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchAttendance = async () => {
    if (!user || !profile?.internshipDomain) return;

    try {
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('userId', '==', user.uid),
        where('course', '==', profile.internshipDomain),
        orderBy('day')
      );
      const snapshot = await getDocs(attendanceQuery);
      setAttendanceEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceEntry)));
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const hasAttendanceForDay = (day: number) => {
    return Boolean(videoProgress[day] || attendanceEntries.some((entry) => Number(entry.day) === Number(day)));
  };

  const requestAttendance = (video: any) => {
    setAttendanceVideo(video);
  };

  const markVideoAsDone = async (video: any) => {
    if (!user) return;
    try {
      setAttendanceSaving(true);
      const day = video.day;
      const progressRef = doc(db, 'userVideoProgress', `${user.uid}-${profile?.internshipDomain}`);
      const newProgress = { ...videoProgress, [day]: true };
      const attendanceRef = doc(db, 'attendance', `${user.uid}-${profile?.internshipDomain}-day-${day}`);

      await setDoc(attendanceRef, {
        userId: user.uid,
        studentName: profile?.fullName || '',
        email: profile?.email || user.email || '',
        course: profile?.internshipDomain,
        day,
        videoId: video.id,
        videoTitle: video.title,
        watchedAt: new Date().toISOString()
      });

      await setDoc(progressRef, {
        userId: user.uid,
        course: profile?.internshipDomain,
        completedVideos: newProgress,
        totalHours: Object.keys(newProgress).length, // 1 hour per video
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setVideoProgress(newProgress);

      // Update user profile with total hours
      const userRef = doc(db, 'users', user.uid);
      const completedDays = getCompletedVideoDays(newProgress);
      const progress = getProgressPercentage(newProgress);
      await updateDoc(userRef, {
        totalHoursCompleted: completedDays.size,
        progress,
        lastVideoCompletedAt: new Date().toISOString()
      });

      // Check if all uploaded videos are completed
      const completedCount = completedDays.size;
      setIsCourseCompleted(completedCount === dailyVideos.length && dailyVideos.length > 0);
      await fetchAttendance();
      setAttendanceVideo(null);
    } catch (error) {
      console.error('Error marking video as done:', error);
      alert('Error marking video as done');
    } finally {
      setAttendanceSaving(false);
    }
  };

  const openVideo = (video: any) => {
    if (!hasAttendanceForDay(video.day)) {
      requestAttendance(video);
      return;
    }

    window.open(video.youtubeUrl, '_blank');
  };
  const verifyCertificate = async () => {

    if (!certificateNo) {
      alert('Please enter certificate number');
      return;
    }

    try {

      setVerifying(true);

      const usersRef = collection(db, 'users');

      const q = query(
        usersRef,
        where(
          'certificateNumber',
          '==',
          certificateNo
        )
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {

        alert('Certificate not found');

        setVerifying(false);

        return;
      }

      const userData =
        snapshot.docs[0].data();

      await generateCertificate(
        userData,
        snapshot.docs[0].id
      );

      setVerifying(false);

    } catch (error) {

      console.error(error);

      alert('Error verifying certificate');

      setVerifying(false);
    }
  };
  // const generateCertificate = () => {
  //   const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  //   const W = 297, H = 210;
  //   const courseName = profile?.internshipDomain || 'Course Name';

  //   // Background
  //   doc.setFillColor(240, 249, 255);
  //   doc.rect(0, 0, W, H, 'F');

  //   // Border
  //   doc.setDrawColor(37, 99, 235);
  //   doc.setLineWidth(3);
  //   doc.rect(10, 10, W - 20, H - 20);
  //   doc.setLineWidth(1);
  //   doc.rect(15, 15, W - 30, H - 30);

  //   // Header
  //   doc.setFontSize(36);
  //   doc.setTextColor(37, 99, 235);
  //   doc.setFont('Helvetica', 'bold');
  //   doc.text('Certificate of Completion', W / 2, 50, { align: 'center' });

  //   // Content
  //   doc.setFontSize(16);
  //   doc.setTextColor(71, 85, 105);
  //   doc.setFont('Helvetica', 'normal');
  //   doc.text('This is to certify that', W / 2, 75, { align: 'center' });

  //   doc.setFontSize(28);
  //   doc.setTextColor(15, 23, 42);
  //   doc.setFont('Helvetica', 'bold');
  //   doc.text(profile?.fullName || 'Student Name', W / 2, 95, { align: 'center' });

  //   doc.setFontSize(16);
  //   doc.setTextColor(71, 85, 105);
  //   doc.setFont('Helvetica', 'normal');
  //   doc.text('has successfully completed the learning program in', W / 2, 115, { align: 'center' });

  //   doc.setFontSize(24);
  //   doc.setTextColor(37, 99, 235);
  //   doc.setFont('Helvetica', 'bold');
  //   doc.text(courseName, W / 2, 135, { align: 'center' });

  //   // Footer
  //   doc.setFontSize(12);
  //   doc.setTextColor(107, 114, 128);
  //   doc.setFont('Helvetica', 'normal');
  //   doc.text('InternMitra - Internship Program', W / 2, 175, { align: 'center' });
  //   doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), W / 2, 185, { align: 'center' });

  //   doc.save(`${profile?.fullName || 'Certificate'}_${courseName.replace(/\s+/g, '_')}_Certificate.pdf`);
  // };

  if (takingTest && courseTest) {
    const q = courseTest.questions[currentQuestionIndex];
    const progressPercent = Math.round(((currentQuestionIndex + 1) / courseTest.questions.length) * 100);

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 pt-12 md:pt-16">
        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-2xl p-8 sm:p-10 flex flex-col space-y-8 relative overflow-hidden">
          {/* Top Progress bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden absolute top-0 left-0 right-0">
            <div
              className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Question {currentQuestionIndex + 1} of {courseTest.questions.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
                {profile?.internshipDomain}
              </span>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to exit the test? Your current answers will not be saved.")) {
                    setTakingTest(false);
                  }
                }}
                className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
                title="Exit Test"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {q.questionText}
            </h2>
          </div>

          <div className="grid gap-4">
            {q.options.map((opt: string, optIndex: number) => {
              const isSelected = selectedAnswers[q.id] === optIndex;
              return (
                <button
                  key={optIndex}
                  onClick={() => handleSelectOption(q.id, optIndex)}
                  className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-left font-bold transition flex items-center gap-4 group ${isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                    : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-700'
                    }`}
                >
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                    }`}>
                    {String.fromCharCode(65 + optIndex)}
                  </span>
                  <span className="text-sm sm:text-base">{opt}</span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-6 border-t border-slate-50">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-5 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            {currentQuestionIndex < courseTest.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition"
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                disabled={submittingTest}
                className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition shadow-xl shadow-indigo-600/20 disabled:opacity-50"
              >
                {submittingTest ? 'Submitting...' : 'Submit Test'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-page">
      <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
        <div className="space-y-3">
          <span className="student-kicker">LMS Center</span>
          <h1 className="student-title">
            Learning / <span className="gradient-text">LMS Archive</span>
          </h1>
          <p className="student-subtitle">
            Access your curated library for <span className="text-slate-800 font-extrabold">{profile?.internshipDomain}</span>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row lg:items-start gap-4">
          {/* Progress Summary Box */}
          <div className="student-card p-5 flex flex-col justify-between min-w-[200px]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Workspace</span>
              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Day {currentDay}/{COURSE_VIDEO_DAY_LIMIT}</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 space-y-1">
              <p><span className="text-slate-800 font-extrabold">{getCompletedVideoDays().size}</span> videos completed</p>
              <p><span className="text-slate-800 font-extrabold">{getCompletedVideoDays().size}</span> hours training logged</p>
            </div>
            {adminApproved && (
              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={() => {
                    if (!user?.uid) {
                      alert("User not found");
                      return;
                    }
                    generateCertificate(profile, user.uid);
                  }}
                  className="student-button-primary w-full min-h-[40px] px-4 py-2 bg-emerald-600 text-white rounded-xl font-black flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider"
                >
                  <Download size={14} />
                  Download Certificate
                </button>
                <button
                  onClick={() => generateAttendanceReport(profile, attendanceEntries, dailyVideos)}
                  className="student-button-soft w-full min-h-[40px] px-4 py-2 text-[10px]"
                >
                  <FileText size={14} />
                  Attendance Report
                </button>
              </div>
            )}
          </div>

          {/* VERIFY CERTIFICATE */}
          <div className="student-card p-5 flex flex-col gap-3 min-w-[220px]">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Verify Certificate
            </div>
            <input
              type="text"
              placeholder="Enter Certificate No."
              value={certificateNo}
              onChange={(e) => setCertificateNo(e.target.value)}
              className="student-input h-10 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
            />
            <button
              onClick={verifyCertificate}
              disabled={verifying}
              className="student-button-primary w-full min-h-[40px] px-4 py-2 text-[10px]"
            >
              <SearchCheck size={14} />
              {verifying ? 'VERIFYING...' : 'VERIFY & DOWNLOAD'}
            </button>
          </div>
        </div>
      </header>

      {/* Test Assessment Section */}
      {isCourseCompleted && courseTest && courseTest.questions && courseTest.questions.length > 0 && (
        <div className="mb-6">
          {!testSubmission ? (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 text-indigo-200 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 border border-indigo-500/30">
                  <ClipboardList size={12} />
                  Final Course Assessment
                </div>
                <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tighter uppercase italic leading-tight">
                  Take Your Final <br />
                  <span className="gradient-text-cyan">Assessment Test</span>
                </h2>
                <p className="text-slate-300 font-semibold italic mb-8 text-sm sm:text-base leading-relaxed">
                  You have successfully completed all daily training videos for {profile?.internshipDomain}!
                  Take the final exam now to test your learning and view your grade.
                </p>
                <button
                  onClick={handleStartTest}
                  className="px-8 py-4 bg-white text-indigo-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition shadow-2xl flex items-center gap-2 animate-bounce"
                >
                  <ClipboardList size={16} />
                  Start Exam Now
                </button>
              </div>
              <ClipboardList size={200} className="absolute -right-10 -bottom-10 text-indigo-500/5 opacity-20 rotate-[15deg] group-hover:rotate-[25deg] transition-transform duration-1000" />
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[#0d2719] via-[#091f14] to-[#040e0a] border border-emerald-500/20 rounded-3xl p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 text-emerald-200 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 border border-emerald-500/30">
                    <CheckCircle2 size={12} />
                    Assessment Completed
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-tight mb-4">
                    Your Performance <span className="gradient-text-cyan">Report</span>
                  </h2>
                  <p className="text-slate-300 font-semibold italic text-base max-w-lg leading-relaxed">
                    Congratulations! You completed the final assessment for {profile?.internshipDomain}.
                    Your grade has been successfully calculated and stored.
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl text-center min-w-[200px] shadow-2xl flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Your Score</span>
                  <span className="text-4xl font-black mb-2">{testSubmission.scorePercentage}%</span>
                  <div className="text-[10px] font-semibold text-slate-400 mb-5">
                    {testSubmission.correctCount} Correct • {testSubmission.wrongCount} Wrong
                  </div>
                  <div className="flex flex-col w-full gap-2.5">
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="w-full py-2.5 bg-white text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 transition"
                    >
                      Review Answers
                    </button>
                    <button
                      onClick={() => generateTestReport(profile, testSubmission, courseTest.questions)}
                      className="w-full py-2.5 bg-emerald-600 border border-emerald-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-700 transition flex items-center justify-center gap-1.5"
                    >
                      <Download size={12} />
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
              <CheckCircle2 size={200} className="absolute -left-10 -bottom-10 text-emerald-500/5 opacity-20 rotate-[15deg]" />
            </div>
          )}
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search for videos, PPTs, or assignments..."
            className="student-input pl-14 pr-5 h-14"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="student-button-soft h-14 px-8 gap-2">
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Featured Video Section */}
      <div className="student-card p-6 sm:p-10 lg:p-12 overflow-hidden relative group">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-100 animate-pulse">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
              Live Training Session
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight uppercase italic">
              Watch Daily <br/><span className="gradient-text">Live Classes</span>
            </h2>
            <p className="text-slate-500 font-semibold italic text-base leading-relaxed max-w-lg">
              Direct access to our YouTube live broadcast. Join the daily 4-hour immersive sessions with industry experts.
            </p>
            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                  <PlayCircle size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">4.5 Hours Daily</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                  <MonitorPlay size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Interactive Chat</span>
              </div>
            </div>
          </div>

          <div className="aspect-video w-full bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl relative border border-white/10 group-hover:scale-[1.01] transition-transform duration-500">
            {videoActive ? (
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="InternMitra Live Training"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                onClick={() => setVideoActive(true)}
                className="w-full h-full flex items-center justify-center bg-slate-950 group/play relative"
              >
                <div className="w-16 h-16 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all group-hover/play:scale-110 border border-white/20">
                  <PlayCircle size={36} className="text-white" />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-500 font-semibold italic">Loading daily videos...</div>
        ) : dailyVideos.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 font-semibold italic">No daily videos available yet.</div>
        ) : (
          dailyVideos.map((video, i) => {
            const isLocked = video.day > currentDay;
            const isCompleted = hasAttendanceForDay(video.day);

            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`student-card p-6 flex flex-col justify-between group transition-all duration-300 relative overflow-hidden ${
                  isLocked
                    ? 'opacity-55 scale-[0.98] blur-[0.5px] cursor-not-allowed border-slate-200/40 bg-slate-50/50'
                    : isCompleted
                      ? 'border-emerald-500/25 bg-emerald-500/[0.01] shadow-emerald-500/5'
                      : 'border-slate-100 hover:border-indigo-500/20 hover:shadow-indigo-500/5'
                }`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-white shadow-md group-hover:rotate-6 transition-transform ${
                    isLocked
                      ? 'bg-slate-100 text-slate-400'
                      : isCompleted
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {isLocked ? <Lock size={20} /> : isCompleted ? <CheckCircle2 size={20} /> : <PlayCircle size={20} />}
                  </div>

                  <div className="space-y-2.5">
                    <div className={`text-[9px] font-black uppercase tracking-[0.25em] flex items-center gap-1.5 ${
                      isLocked ? 'text-slate-400' : isCompleted ? 'text-emerald-600' : 'text-indigo-600'
                    }`}>
                      <Calendar size={10} />
                      Day {video.day}
                    </div>
                    <h3 className={`text-lg font-black leading-tight uppercase tracking-tight ${
                      isLocked ? 'text-slate-400' : 'text-slate-900 group-hover:text-indigo-600 transition-colors'
                    }`}>
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-slate-500 italic font-semibold text-xs line-clamp-2">{video.description}</p>
                    )}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100/60 flex items-center justify-between">
                  {isLocked ? (
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                      <Lock size={12} /> Unlocks Day {video.day}
                    </div>
                  ) : isCompleted ? (
                    <div className="text-[9px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Completed
                    </div>
                  ) : (
                    <button
                      onClick={() => requestAttendance(video)}
                      className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition underline underline-offset-4 decoration-2"
                    >
                      <CheckCircle2 size={12} /> Mark Attendance
                    </button>
                  )}
                  {!isLocked && (
                    <button
                      onClick={() => openVideo(video)}
                      className="w-10 h-10 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 shadow-inner group/btn"
                      title={isCompleted ? 'Open video' : 'Mark attendance first'}
                    >
                      <ChevronRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}

        {/* Feature Teaser Card */}
        <div className="student-panel p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative group">
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <BookOpenCheck size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-black tracking-tight leading-tight italic uppercase">
              Live Training <br />Archive
            </h3>
            <p className="text-slate-400 font-semibold leading-relaxed italic text-xs">
              Access all past 4-hour daily sessions for quick reference.
            </p>
            <button className="student-button-primary w-full bg-white text-slate-900 border border-slate-100 hover:bg-slate-50 min-h-[40px] text-[10px]">
              Watch Recordings
            </button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-[40px] rounded-full group-hover:scale-150 transition-all duration-500" />
        </div>
      </div>

      {/* Attendance Modal */}
      {attendanceVideo && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 mb-1">
                  Attendance Required
                </div>
                <h2 className="text-xl font-black text-slate-900 uppercase italic leading-tight">
                  Day {attendanceVideo.day}
                </h2>
              </div>
              <button
                onClick={() => setAttendanceVideo(null)}
                disabled={attendanceSaving}
                className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-slate-600 font-semibold leading-relaxed text-sm">
                Please mark your attendance before opening this class video. If attendance is not marked for a day, the report will show that day as absent.
              </p>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Video</div>
                <div className="font-extrabold text-slate-900 text-sm">{attendanceVideo.title}</div>
              </div>
              <button
                onClick={() => markVideoAsDone(attendanceVideo)}
                disabled={attendanceSaving}
                className="student-button-primary w-full h-12 text-xs"
              >
                <CheckCircle2 size={16} />
                {attendanceSaving ? 'Marking...' : 'Mark Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Report Modal */}
      {showReportModal && testSubmission && courseTest && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 mb-1 block">
                  Evaluation Report
                </span>
                <h2 className="text-xl font-black text-slate-900 uppercase italic">
                  Performance Review
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => generateTestReport(profile, testSubmission, courseTest.questions)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition"
                >
                  <Download size={12} /> PDF
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Score Stats Banner */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="text-center">
                  <div className="text-xl font-black text-slate-900">{testSubmission.scorePercentage}%</div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Total Score</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-green-600">{testSubmission.correctCount}</div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-red-600">{testSubmission.wrongCount}</div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Incorrect</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-slate-800">{testSubmission.totalQuestions}</div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Questions</div>
                </div>
              </div>

              {/* Question list */}
              <div className="space-y-6">
                {courseTest.questions.map((q: any, index: number) => {
                  const selectedIdx = testSubmission.answers[q.id];
                  const isCorrect = selectedIdx === q.correctOptionIndex;

                  return (
                    <div key={q.id || index} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="bg-slate-200 text-slate-700 text-[9px] font-black px-2.5 py-1 rounded-md uppercase">
                          Question {index + 1}
                        </span>
                        {isCorrect ? (
                          <span className="text-green-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 size={12} /> Correct
                          </span>
                        ) : (
                          <span className="text-red-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <X size={12} /> Incorrect
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-black text-slate-900 leading-snug">
                        {q.questionText}
                      </h3>

                      <div className="grid gap-2.5">
                        {q.options.map((opt: string, optIndex: number) => {
                          const isSelected = selectedIdx === optIndex;
                          const isCorrectOpt = q.correctOptionIndex === optIndex;

                          let optStyle = 'border-slate-100 bg-white text-slate-700';
                          let badgeStyle = 'bg-slate-100 text-slate-500';

                          if (isCorrectOpt) {
                            optStyle = 'border-green-300 bg-green-50/50 text-green-900';
                            badgeStyle = 'bg-green-600 text-white';
                          } else if (isSelected && !isCorrectOpt) {
                            optStyle = 'border-red-300 bg-red-50/50 text-red-900';
                            badgeStyle = 'bg-red-600 text-white';
                          }

                          return (
                            <div
                              key={optIndex}
                              className={`p-3.5 rounded-xl border-2 font-bold text-sm flex items-center gap-3 ${optStyle}`}
                            >
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${badgeStyle}`}>
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <span className="flex-1">{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex gap-4 bg-slate-50">
              <button
                onClick={() => setShowReportModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-black w-full h-12 rounded-xl text-xs uppercase tracking-widest transition"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
