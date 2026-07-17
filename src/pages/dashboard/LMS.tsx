import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, where, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import {
  PlayCircle,
  FileText,
  FileVideo,
  Download,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  ClipboardList,
  ExternalLink,
  Info,
  Clock,
  BookOpen
} from 'lucide-react';
import { generateCertificate } from './generateCertificate';
import { AttendanceEntry } from './generateAttendanceReport';
import { generateTestReport } from './generateTestReport';
import { COURSE_VIDEO_DAY_LIMIT } from '../../lib/constants';

interface VideoProgress {
  [day: number]: boolean;
}

export default function LMS() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [dailyVideos, setDailyVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoProgress, setVideoProgress] = useState<VideoProgress>({});
  const [currentDay, setCurrentDay] = useState(1);
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntry[]>([]);
  const [attendanceSaving, setAttendanceSaving] = useState(false);

  // Assessment (Test) States
  const [courseTest, setCourseTest] = useState<any>(null);
  const [testSubmission, setTestSubmission] = useState<any>(null);
  const [takingTest, setTakingTest] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittingTest, setSubmittingTest] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Payment QR Code modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchDailyVideos();
    fetchVideoProgress();
    fetchAttendance();
    calculateCurrentDay();
    fetchTestAndSubmission();
  }, [profile, user]);

  useEffect(() => {
    if (dailyVideos.length > 0) {
      const completedCount = getCompletedVideoDays(videoProgress, attendanceEntries).size;
      setIsCourseCompleted(completedCount === dailyVideos.length);
    }
  }, [dailyVideos, videoProgress, attendanceEntries]);

  const fetchTestAndSubmission = async () => {
    if (!profile?.internshipDomain || !user?.uid) return;
    try {
      const testRef = doc(db, 'courseTests', profile.internshipDomain);
      const testSnap = await getDoc(testRef);
      if (testSnap.exists()) setCourseTest(testSnap.data());

      const submissionRef = doc(db, 'testSubmissions', `${user.uid}-${profile.internshipDomain}`);
      const submissionSnap = await getDoc(submissionRef);
      if (submissionSnap.exists()) setTestSubmission(submissionSnap.data());
    } catch (error) {
      console.error('Error fetching test/submission:', error);
    }
  };

  const calculateCurrentDay = () => {
    if (!profile?.registrationDate) {
      setCurrentDay(1);
      return;
    }
    let dateStr = profile.registrationDate.replace(/-(\d)T/g, '-0$1T');
    const registrationDate = new Date(dateStr);
    if (isNaN(registrationDate.getTime())) {
      setCurrentDay(1);
      return;
    }
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - registrationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setCurrentDay(Math.min(diffDays, COURSE_VIDEO_DAY_LIMIT));
  };

  const fetchDailyVideos = async () => {
    try {
      const videosRef = collection(db, 'dailyVideos');
      const userCourse = profile?.internshipDomain || '';
      const q = query(videosRef, where('course', '==', userCourse), orderBy('day'));
      const snapshot = await getDocs(q);
      const videosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDailyVideos(videosData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching daily videos:', error);
      setLoading(false);
    }
  };

  const fetchVideoProgress = async () => {
    if (!user || !profile?.internshipDomain) return;
    try {
      const progressRef = doc(db, 'userVideoProgress', `${user.uid}-${profile.internshipDomain}`);
      const progressDoc = await getDoc(progressRef);
      if (progressDoc.exists()) {
        setVideoProgress(progressDoc.data().completedVideos || {});
      }
    } catch (error) {
      console.error('Error fetching video progress:', error);
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

  const getUploadedVideoDays = () => new Set(dailyVideos.map((video) => String(video.day || '').trim()).filter(Boolean));

  const getCompletedVideoDays = (progress: VideoProgress = videoProgress, attendance: AttendanceEntry[] = attendanceEntries) => {
    const uploadedDays = getUploadedVideoDays();
    const completedDays = new Set<string>();
    Object.entries(progress).forEach(([day, completed]) => {
      if (completed && uploadedDays.has(String(day).trim())) completedDays.add(String(day).trim());
    });
    attendance.forEach((entry) => {
      if (uploadedDays.has(String(entry.day).trim())) completedDays.add(String(entry.day).trim());
    });
    return completedDays;
  };

  const getProgressPercentage = (progress: VideoProgress = videoProgress, attendance: AttendanceEntry[] = attendanceEntries) => {
    const uploadedCount = getUploadedVideoDays().size;
    return uploadedCount === 0 ? 0 : Math.round((getCompletedVideoDays(progress, attendance).size / uploadedCount) * 100);
  };

  const markVideoAsDone = async (video: any) => {
    if (!user || !profile?.internshipDomain) return;
    try {
      setAttendanceSaving(true);
      const day = video.day;
      const progressRef = doc(db, 'userVideoProgress', `${user.uid}-${profile.internshipDomain}`);
      const newProgress = { ...videoProgress, [day]: true };
      const attendanceRef = doc(db, 'attendance', `${user.uid}-${profile.internshipDomain}-day-${day}`);

      await setDoc(attendanceRef, {
        userId: user.uid,
        studentName: profile.fullName || '',
        email: profile.email || user.email || '',
        course: profile.internshipDomain,
        day,
        videoId: video.id,
        videoTitle: video.title,
        watchedAt: new Date().toISOString()
      });

      await setDoc(progressRef, {
        userId: user.uid,
        course: profile.internshipDomain,
        completedVideos: newProgress,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setVideoProgress(newProgress);
      const completedDays = getCompletedVideoDays(newProgress);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        totalHoursCompleted: completedDays.size,
        progress: getProgressPercentage(newProgress),
        lastVideoCompletedAt: new Date().toISOString()
      });

      setIsCourseCompleted(completedDays.size === dailyVideos.length && dailyVideos.length > 0);
      await fetchAttendance();
    } catch (error) {
      console.error('Error marking video as done:', error);
    } finally {
      setAttendanceSaving(false);
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
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitTest = async () => {
    if (!user || !profile || !courseTest) return;
    if (Object.keys(selectedAnswers).length < courseTest.questions.length) {
      if (!confirm("You have unanswered questions. Are you sure you want to submit?")) return;
    }
    setSubmittingTest(true);
    try {
      let correctCount = 0;
      courseTest.questions.forEach((q: any) => {
        if (selectedAnswers[q.id] === q.correctOptionIndex) correctCount++;
      });
      const submissionData = {
        userId: user.uid,
        studentName: profile.fullName || 'Student',
        email: profile.email || user.email || '',
        course: profile.internshipDomain,
        answers: selectedAnswers,
        correctCount,
        wrongCount: courseTest.questions.length - correctCount,
        totalQuestions: courseTest.questions.length,
        scorePercentage: Math.round((correctCount / courseTest.questions.length) * 100),
        submittedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'testSubmissions', `${user.uid}-${profile.internshipDomain}`), submissionData);
      setTestSubmission(submissionData);
      setTakingTest(false);
      setShowReportModal(true);
    } catch (error) {
      alert('Error submitting test');
    } finally {
      setSubmittingTest(false);
    }
  };

  const CourseDashboard = () => {
    const progress = getProgressPercentage();
    const isTestPaid = profile?.hasPaidExam || testSubmission;
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 text-white rounded-3xl p-6 md:p-10 shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="bg-white/20 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-block">{profile?.internshipDomain} Course</span>
            <h1 className="text-3xl font-extrabold tracking-tight">Curriculum Dashboard</h1>
            <p className="text-blue-100 text-sm">Watch daily recordings to complete the curriculum. Complete the final assessment to unlock your certificate.</p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex-1 max-w-xs bg-black/20 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs font-bold text-cyan-200">{progress}% Attended</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <h3 className="text-lg font-extrabold uppercase text-gray-900">Live Training</h3>
            <p className="text-gray-500 text-sm mt-2">Join our daily 4-hour live broadcasts.</p>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition">Join Live <ExternalLink size={14} /></a>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <h3 className="text-lg font-extrabold uppercase text-gray-900">Recorded Lectures</h3>
            <p className="text-gray-500 text-sm mt-2">Review all daily sessions at your own pace.</p>
            <button onClick={() => navigate('recordings')} className="mt-6 w-full h-11 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 transition">Watch Recordings</button>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm md:col-span-2">
             <h3 className="text-lg font-extrabold uppercase text-gray-900">Graded Assessment</h3>
             {testSubmission ? <p className="text-green-600 font-bold mt-2">Result: {testSubmission.scorePercentage}%</p> : <p className="text-gray-500 text-sm mt-2">Unlock final assessment after 100% course completion.</p>}
             <div className="mt-6">
                {testSubmission ? <button onClick={() => setShowReportModal(true)} className="w-full h-11 bg-slate-900 text-white rounded-xl text-xs font-bold">Review Report</button> 
                : progress < 100 ? <button disabled className="w-full h-11 bg-gray-100 text-gray-400 rounded-xl text-xs font-bold">Complete 100% First</button>
                : !isTestPaid ? <button onClick={() => setShowPaymentModal(true)} className="w-full h-11 bg-orange-600 text-white rounded-xl text-xs font-bold">Unlock Test (₹248)</button>
                : <button onClick={handleStartTest} className="w-full h-11 bg-green-600 text-white rounded-xl text-xs font-bold">Start Test</button>}
             </div>
          </div>
        </div>
      </div>
    );
  };

  const RecordingsList = () => (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold"><ChevronLeft size={16}/> Back</button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dailyVideos.map((v) => (
          <div key={v.id} className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900">{v.title}</h3>
            <button onClick={() => navigate(`recordings/${v.day}`)} className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Watch</button>
          </div>
        ))}
      </div>
    </div>
  );

  const VideoPlayerView = () => {
    const { dayNum } = useParams();
    const video = dailyVideos.find(v => String(v.day) === String(dayNum));
    const [isVideoCompleted, setIsVideoCompleted] = useState(false);
    
    useEffect(() => {
        if(video) setIsVideoCompleted(hasAttendanceForDay(video.day));
    }, [video]);

    return (
      <div className="space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold"><ChevronLeft size={16}/> Back</button>
        <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg">
             <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${video?.youtubeUrl?.split('v=')[1]}`} allowFullScreen />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200">
           {!isVideoCompleted ? <button onClick={() => markVideoAsDone(video)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">Mark Attendance</button> : <p className="text-green-600 font-bold">Attendance Marked</p>}
        </div>
      </div>
    );
  };

  if (takingTest && courseTest) {
    return (
        <div className="max-w-2xl mx-auto p-8 space-y-6">
            <h2 className="text-2xl font-black">{courseTest.questions[currentQuestionIndex].questionText}</h2>
            {courseTest.questions[currentQuestionIndex].options.map((opt: string, i: number) => (
                <button key={i} onClick={() => handleSelectOption(courseTest.questions[currentQuestionIndex].id, i)} className="block w-full p-4 border rounded-xl font-bold">{opt}</button>
            ))}
            {currentQuestionIndex === courseTest.questions.length - 1 ? <button onClick={handleSubmitTest} className="w-full py-3 bg-indigo-600 text-white rounded-xl">Submit</button> : <button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="w-full py-3 bg-slate-900 text-white rounded-xl">Next</button>}
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <Routes>
        <Route index element={<CourseDashboard />} />
        <Route path="recordings" element={<RecordingsList />} />
        <Route path="recordings/:dayNum" element={<VideoPlayerView />} />
      </Routes>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-sm space-y-4">
                <h2 className="text-xl font-black">Pay Assessment Fee</h2>
                <p className="text-sm font-medium">Scan QR to pay ₹248 for exam access.</p>
                <img src="/payment/shivam-qr.jpeg" alt="QR" className="w-full h-auto" />
                <button onClick={() => setShowPaymentModal(false)} className="w-full py-3 bg-gray-200 rounded-xl font-bold">Close</button>
            </div>
        </div>
      )}

      {showReportModal && testSubmission && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-lg space-y-4">
                <h2 className="text-xl font-black">Your Score: {testSubmission.scorePercentage}%</h2>
                <button onClick={() => setShowReportModal(false)} className="w-full py-3 bg-slate-900 text-white rounded-xl">Close</button>
            </div>
        </div>
      )}
    </div>
  );
}
