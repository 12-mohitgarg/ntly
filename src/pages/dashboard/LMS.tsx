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
  MonitorPlay,
  Calendar,
  CheckCircle2,
  Lock,
  SearchCheck,
  X

} from 'lucide-react';
import { generateCertificate } from './generateCertificate';
import { AttendanceEntry, generateAttendanceReport } from './generateAttendanceReport';

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

  useEffect(() => {
    fetchDailyVideos();
    fetchVideoProgress();
    fetchAdminApproval();
    fetchAttendance();
    calculateCurrentDay();
  }, [profile]);

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
    const calculatedDay = Math.min(diffDays, 15);
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

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-4 uppercase italic">Learning / <span className="text-blue-600">LMS Archive</span></h1>
          <p className="text-xl text-slate-500 font-bold italic leading-relaxed">Access your curated library for <span className="text-slate-900 border-b-4 border-blue-50">{profile?.internshipDomain}</span>.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-black text-slate-400 uppercase tracking-widest">Day {currentDay} of 15</div>
            <div className="text-xs font-bold text-slate-500">{getCompletedVideoDays().size} videos completed • {getCompletedVideoDays().size} hours</div>
          </div>
          <div className="flex flex-col gap-4">

            {adminApproved && (
              <>

              <button
                onClick={() => {

                  if (!user?.uid) {
                    alert("User not found");
                    return;
                  }

                  generateCertificate(
                    profile,
                    user.uid
                  );
                }}
                className="bg-green-600 text-white p-5 px-10 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-green-600/20 hover:bg-green-700 transition uppercase tracking-widest text-xs"
              >
                <Download size={20} />
                Download Certificate
              </button>
              <button
                onClick={() => generateAttendanceReport(profile, attendanceEntries, dailyVideos)}
                className="bg-slate-900 text-white p-5 px-10 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition uppercase tracking-widest text-xs"
              >
                <FileText size={20} />
                Attendance Report
              </button>
              </>
            )}

            {/* VERIFY CERTIFICATE */}

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-lg flex flex-col gap-3">

              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Verify Existing Certificate
              </div>

              <input
                type="text"
                placeholder="Enter Certificate No."
                value={certificateNo}
                onChange={(e) =>
                  setCertificateNo(e.target.value)
                }
                className="h-14 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />

              <button
                onClick={verifyCertificate}
                disabled={verifying}
                className="bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition"
              >
                <SearchCheck size={18} />

                {verifying
                  ? 'VERIFYING...'
                  : 'VERIFY & DOWNLOAD'}
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-grow group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={24} />
          <input
            type="text"
            placeholder="Search for videos, PPTs, or assignments..."
            className="w-full h-16 pl-16 pr-6 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-900 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="h-16 px-10 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition">
          <Filter size={20} /> Filters
        </button>
      </div>

      {/* Featured Video Section */}
      <div className="bg-white p-10 lg:p-14 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-900/[0.02] overflow-hidden relative group">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-red-100 animate-pulse">
              <div className="w-2 h-2 bg-red-600 rounded-full" />
              Live Training Session
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-8 tracking-tighter leading-tight uppercase italic">Watch Daily <br /><span className="text-blue-600">Live Classes</span></h2>
            <p className="text-slate-500 font-bold italic mb-10 text-xl leading-relaxed max-w-lg">
              "Direct access to our YouTube live broadcast. Join the daily 4-hour immersive sessions with industry experts."
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <PlayCircle size={20} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-900 italic">4.5 Hours Daily</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <MonitorPlay size={20} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-900 italic">Interactive Chat</span>
              </div>
            </div>
          </div>

          <div className="aspect-video w-full bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative group-hover:scale-[1.02] transition-transform duration-700">
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
                className="w-full h-full flex items-center justify-center bg-slate-900 group/play"
              >
                <div className="w-20 h-20 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all group-hover/play:scale-110">
                  <PlayCircle size={48} className="text-white" />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-500 font-bold italic">Loading daily videos...</div>
        ) : dailyVideos.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 font-bold italic">No daily videos available yet.</div>
        ) : (
          dailyVideos.map((video, i) => {
            const isLocked = video.day > currentDay;
            const isCompleted = hasAttendanceForDay(video.day);

            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white p-10 rounded-[3rem] border shadow-xl flex flex-col group transition-all duration-500 relative overflow-hidden ${isLocked
                  ? 'border-slate-100 opacity-60'
                  : isCompleted
                    ? 'border-green-200 shadow-green-900/[0.02]'
                    : 'border-slate-100 shadow-slate-900/[0.02] hover:shadow-2xl hover:border-blue-100'
                  }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 border border-white shadow-md group-hover:rotate-12 transition-transform relative z-10 ${isLocked
                  ? 'bg-slate-100 text-slate-400'
                  : isCompleted
                    ? 'bg-green-50 text-green-600'
                    : 'bg-blue-50 text-blue-600'
                  }`}>
                  {isLocked ? <Lock size={32} /> : isCompleted ? <CheckCircle2 size={32} /> : <PlayCircle size={32} />}
                </div>
                <div className="flex-grow relative z-10">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 flex items-center gap-2 ${
                    isLocked ? 'text-slate-400' : isCompleted ? 'text-green-600' : 'text-blue-600'
                  }">
                    <Calendar size={12} />
                    Day {video.day}
                  </div>
                  <h3 className={`text-2xl font-black mb-6 leading-tight uppercase tracking-tighter ${isLocked ? 'text-slate-400' : 'text-slate-900 group-hover:text-blue-600 transition-colors'
                    }`}>{video.title}</h3>
                  {video.description && (
                    <p className="text-slate-500 italic font-bold mb-10 text-sm line-clamp-2">{video.description}</p>
                  )}
                </div>
                <div className="pt-8 border-t border-slate-50 flex items-center justify-between relative z-10">
                  {isLocked ? (
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <Lock size={14} className="inline mr-1" /> Unlocks Day {video.day}
                    </div>
                  ) : isCompleted ? (
                    <div className="text-[10px] font-black uppercase tracking-widest text-green-600">
                      <CheckCircle2 size={14} className="inline mr-1" /> Completed
                    </div>
                  ) : (
                    <button
                      onClick={() => requestAttendance(video)}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition underline underline-offset-8"
                    >
                      <CheckCircle2 size={14} /> Mark Attendance
                    </button>
                  )}
                  {!isLocked && (
                    <button
                      onClick={() => openVideo(video)}
                      className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-inner group/btn"
                      title={isCompleted ? 'Open video' : 'Mark attendance first'}
                    >
                      <ChevronRight size={24} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 -z-0" />
              </motion.div>
            );
          })
        )}

        {/* Feature Teaser Card */}
        <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col justify-between shadow-2xl shadow-slate-900/40 overflow-hidden relative group">
          <div className="relative z-10">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
              <BookOpenCheck size={36} />
            </div>
            <h3 className="text-3xl font-black mb-6 tracking-tighter leading-tight italic uppercase">Live Training <br />Archive</h3>
            <p className="text-slate-400 font-bold leading-relaxed italic mb-10 text-sm">Access all past 4-hour daily sessions for reference.</p>
            <button className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition shadow-xl">Watch Recordings</button>
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full group-hover:scale-150 transition-all duration-700" />
        </div>
      </div>

      {attendanceVideo && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 mb-2">
                  Attendance Required
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase italic leading-tight">
                  Day {attendanceVideo.day}
                </h2>
              </div>
              <button
                onClick={() => setAttendanceVideo(null)}
                disabled={attendanceSaving}
                className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-slate-600 font-bold leading-relaxed">
                Please mark your attendance before opening this class video. If attendance is not marked for a day, the report will show that day as absent.
              </p>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Video</div>
                <div className="font-black text-slate-900">{attendanceVideo.title}</div>
              </div>
              <button
                onClick={() => markVideoAsDone(attendanceVideo)}
                disabled={attendanceSaving}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition disabled:opacity-60"
              >
                <CheckCircle2 size={18} />
                {attendanceSaving ? 'Marking...' : 'Mark Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}
