import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  getDoc
} from 'firebase/firestore';

import { motion } from 'motion/react';
import {
  Youtube,
  Save,
  Edit2,
  Trash2,
  Plus,
  Calendar,
  X,
  Video,
  Clock,
  CheckCircle2,
  Sparkles,
  ClipboardList,
  ArrowLeft,
  Search,
  Filter,
  Eye,
  ChevronDown,
  UserCheck,
  Info,
  MoreVertical
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { COURSE_VIDEO_DAY_LIMIT, INTERNSHIP_DOMAINS } from '../../lib/constants';
import { useAuth } from '../../components/AuthContext';
import { AttendanceEntry, AttendanceStudent, generateCourseAttendanceReport } from '../dashboard/generateAttendanceReport';

interface DailyVideo {
  id: string;
  day: number;
  title: string;
  youtubeUrl: string;
  description: string;
  course: string;
}

export default function ManageDailyVideos() {
  const navigate = useNavigate();
  const { adminProfile } = useAuth();
  const [videos, setVideos] = useState<DailyVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState<DailyVideo | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>(INTERNSHIP_DOMAINS[0] || 'Web Development');
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [loadingTest, setLoadingTest] = useState(false);
  const [savingTest, setSavingTest] = useState(false);

  // Attendance & Student States
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntry[]>([]);
  const [courseStudents, setCourseStudents] = useState<AttendanceStudent[]>([]);
  const [formData, setFormData] = useState({
    day: 1,
    title: '',
    youtubeUrl: '',
    description: '',
    course: selectedCourse
  });

  // Filter & Pagination States for Attendance
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState('');
  const [attendanceDayFilter, setAttendanceDayFilter] = useState('');
  const [attendancePage, setAttendancePage] = useState(1);
  const [attendancePerPage, setAttendancePerPage] = useState(10);
  const [selectedEntryDetails, setSelectedEntryDetails] = useState<AttendanceEntry | null>(null);

  const isTeacher = adminProfile?.role === 'teacher';
  const assignedCourse = adminProfile?.course || '';

  useEffect(() => {
    if (isTeacher && assignedCourse) {
      setSelectedCourse(assignedCourse);
    }
  }, [isTeacher, assignedCourse]);

  useEffect(() => {
    if (selectedCourse) {
      fetchVideos();
      fetchCourseStatus();
      fetchAttendance();
      fetchCourseStudents();

      setFormData(prev => ({
        ...prev,
        course: selectedCourse
      }));
    }
  }, [selectedCourse]);

  const fetchVideos = async () => {
    if (!selectedCourse) {
      setVideos([]);
      setLoading(false);
      return;
    }

    try {
      const videosRef = collection(db, 'dailyVideos');
      const q = query(videosRef, where('course', '==', selectedCourse), orderBy('day'));
      const snapshot = await getDocs(q);
      const videosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DailyVideo));
      setVideos(videosData);

      // Calculate next available day
      if (videosData.length > 0) {
        const maxDay = Math.max(...videosData.map(v => v.day));
        const nextDay = maxDay < COURSE_VIDEO_DAY_LIMIT ? maxDay + 1 : COURSE_VIDEO_DAY_LIMIT;
        setFormData(prev => ({ ...prev, day: nextDay }));
      } else {
        setFormData(prev => ({ ...prev, day: 1 }));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setLoading(false);
    }
  };

  const fetchCourseStatus = async () => {
    if (!selectedCourse) return;

    try {
      const docRef = doc(db, "courseCompletion", selectedCourse);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCourseCompleted(docSnap.data().completed || false);
      } else {
        setCourseCompleted(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedCourse) {
      setAttendanceEntries([]);
      return;
    }

    try {
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('course', '==', selectedCourse),
        orderBy('day')
      );
      const snapshot = await getDocs(attendanceQuery);
      setAttendanceEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceEntry)));
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchCourseStudents = async () => {
    if (!selectedCourse) {
      setCourseStudents([]);
      return;
    }

    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('internshipDomain', '==', selectedCourse)
      );
      const snapshot = await getDocs(usersQuery);
      setCourseStudents(snapshot.docs.map((studentDoc) => {
        const data = studentDoc.data();
        return {
          id: studentDoc.id,
          uid: studentDoc.id,
          fullName: data.fullName || '',
          email: data.email || '',
          college: data.college || ''
        };
      }));
    } catch (error) {
      console.error('Error fetching course students:', error);
      setCourseStudents([]);
    }
  };

  const extractVideoId = (url: string): string => {
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  const handleSave = async () => {
    if (isTeacher && formData.course !== assignedCourse) {
      alert('You can add videos only for your assigned course');
      return;
    }

    if (!formData.title || !formData.youtubeUrl || !formData.course) {
      alert('Please fill in title, YouTube URL, and select a course');
      return;
    }

    const videoId = extractVideoId(formData.youtubeUrl);
    if (!videoId) {
      alert('Invalid YouTube URL');
      return;
    }

    try {
      if (editingVideo) {
        await setDoc(doc(db, 'dailyVideos', editingVideo.id), {
          ...formData,
          youtubeVideoId: videoId,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } else {
        const existingVideo = videos.find(v => v.day === formData.day);
        if (existingVideo) {
          alert(`Day ${formData.day} already has a video for ${formData.course}. Please edit or delete it first.`);
          return;
        }

        await setDoc(doc(db, 'dailyVideos', `${formData.course}-day-${formData.day}`), {
          ...formData,
          youtubeVideoId: videoId,
          createdAt: new Date().toISOString()
        });
      }

      await fetchVideos();
      resetForm();
    } catch (error) {
      console.error('Error saving video:', error);
      alert('Error saving video');
    }
  };

  const handleEdit = (video: DailyVideo) => {
    setEditingVideo(video);
    setFormData({
      day: video.day,
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      description: video.description,
      course: video.course
    });
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      await deleteDoc(doc(db, 'dailyVideos', videoId));
      await fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Error deleting video');
    }
  };

  const handleDeleteAttendanceEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attendance entry?')) return;
    try {
      await deleteDoc(doc(db, 'attendance', id));
      fetchAttendance();
    } catch (error) {
      console.error('Error deleting attendance:', error);
    }
  };

  const markCourseCompleted = async () => {
    if (!selectedCourse) return;

    try {
      await setDoc(
        doc(db, "courseCompletion", selectedCourse),
        {
          course: selectedCourse,
          completed: true,
          completedAt: new Date().toISOString()
        }
      );
      setCourseCompleted(true);
      alert("Course marked as completed");
    } catch (error) {
      console.log(error);
      alert("Error");
    }
  };

  const resetForm = () => {
    setEditingVideo(null);
    setFormData({
      day: videos.length + 1 > COURSE_VIDEO_DAY_LIMIT ? COURSE_VIDEO_DAY_LIMIT : videos.length + 1,
      title: '',
      youtubeUrl: '',
      description: '',
      course: selectedCourse
    });
  };

  // Filter & Pagination logic for Attendance Table
  const filteredAttendanceEntries = attendanceEntries.filter(entry => {
    const matchesSearch = !attendanceSearchQuery ||
      (entry.studentName || '').toLowerCase().includes(attendanceSearchQuery.toLowerCase()) ||
      (entry.email || '').toLowerCase().includes(attendanceSearchQuery.toLowerCase()) ||
      (entry.videoTitle || '').toLowerCase().includes(attendanceSearchQuery.toLowerCase());

    const matchesDay = !attendanceDayFilter || String(entry.day) === attendanceDayFilter;

    return matchesSearch && matchesDay;
  });

  const totalAttendancePages = Math.ceil(filteredAttendanceEntries.length / attendancePerPage);
  const paginatedAttendance = filteredAttendanceEntries.slice(
    (attendancePage - 1) * attendancePerPage,
    attendancePage * attendancePerPage
  );

  return (
    <div className="space-y-8 text-left font-sans select-none pb-12">
      
      {/* Header Bar & Course Selector (Matching UI Screenshot) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Manage Daily Videos
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
            Upload, manage and track daily lecture videos by course.
          </p>
        </div>

        {/* SELECT COURSE Dropdown Selector */}
        <div className="flex items-center gap-3 bg-white border border-slate-200/80 px-4 py-2 rounded-2xl shadow-xs shrink-0">
          <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">SELECT COURSE:</Label>
          <div className="relative">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={isTeacher}
              className={`h-9 pr-7 pl-3 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition cursor-pointer appearance-none ${
                isTeacher ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              {INTERNSHIP_DOMAINS.map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Top 2-Column Grid: Form Left, Current Schedule Right (Matching UI Screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Card: Add New Video Form (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-xs ${
                editingVideo ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              }`}>
                {editingVideo ? <Edit2 size={18} /> : <Plus size={20} />}
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                {editingVideo ? 'Edit Video' : 'Add New Video'}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {courseCompleted ? (
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  Marked Completed
                </span>
              ) : (
                <button
                  type="button"
                  onClick={markCourseCompleted}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                >
                  Mark Course Completed
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate('/admin-dashboard?tab=college-wise')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
              >
                View Course Progress
              </button>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* DAY (1-20) */}
              <div className="sm:col-span-4 space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">DAY (1-{COURSE_VIDEO_DAY_LIMIT})</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    max={COURSE_VIDEO_DAY_LIMIT}
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) || 1 })}
                    className="h-12 px-4 text-xs font-extrabold rounded-2xl bg-slate-50/60 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 transition shadow-inner"
                    required
                  />
                  <Calendar size={16} className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* VIDEO TITLE */}
              <div className="sm:col-span-8 space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">VIDEO TITLE</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter video title"
                  className="h-12 px-4 text-xs font-semibold rounded-2xl bg-slate-50/60 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 transition shadow-inner"
                  required
                />
              </div>
            </div>

            {/* YOUTUBE URL */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">YOUTUBE URL</Label>
              <div className="relative">
                <Youtube className="absolute left-4 top-3.5 text-red-500" size={18} />
                <Input
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="h-12 pl-12 pr-4 text-xs font-semibold rounded-2xl bg-slate-50/60 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 transition shadow-inner"
                  required
                />
              </div>
            </div>

            {/* DESCRIPTION (OPTIONAL) */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500">DESCRIPTION (OPTIONAL)</Label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the video content"
                className="w-full h-24 p-4 text-xs font-semibold rounded-2xl bg-slate-50/60 border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition shadow-inner resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-98 transition cursor-pointer"
              >
                <Save size={16} />
                <span>{editingVideo ? 'Update Video' : 'Add Video'}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Card: Current Schedule (5 cols) (Matching UI Screenshot) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 min-h-[460px] flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 tracking-tight">Current Schedule</h3>
              <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                {videos.length} / {COURSE_VIDEO_DAY_LIMIT} VIDEOS
              </span>
            </div>

            {videos.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto border border-blue-100 shadow-2xs">
                  <Calendar size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">No videos uploaded yet</h4>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    Start by adding Day 1 video for {selectedCourse}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-blue-200 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0 font-bold">
                        <Youtube size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-0.5">
                          Day {video.day}
                        </span>
                        <h5 className="text-xs font-black text-slate-900 truncate leading-tight">
                          {video.title}
                        </h5>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(video)}
                        className="p-1.5 text-blue-600 hover:bg-white rounded-lg transition cursor-pointer"
                        title="Edit Video"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(video.id)}
                        className="p-1.5 text-rose-500 hover:bg-white rounded-lg transition cursor-pointer"
                        title="Delete Video"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Bottom Section: Attendance Entries Table Card (Matching UI Screenshot) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Header & Search / Filter Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Attendance Entries</h2>
              <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                {filteredAttendanceEntries.length} ENTRIES
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{selectedCourse}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={attendanceSearchQuery}
                onChange={(e) => {
                  setAttendanceSearchQuery(e.target.value);
                  setAttendancePage(1);
                }}
                placeholder="Search students..."
                className="w-full h-10 pl-10 pr-4 rounded-full bg-slate-50/80 border border-slate-200/80 text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 transition shadow-inner"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={attendanceDayFilter}
                onChange={(e) => {
                  setAttendanceDayFilter(e.target.value);
                  setAttendancePage(1);
                }}
                className="h-10 px-4 rounded-full bg-slate-50/80 border border-slate-200/80 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-500 cursor-pointer appearance-none pr-8"
              >
                <option value="">All Days</option>
                {Array.from({ length: 20 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={String(d)}>Day {d}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table Content */}
        {filteredAttendanceEntries.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold text-xs">No attendance entries matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">STUDENT</th>
                  <th className="py-3.5 px-4">EMAIL</th>
                  <th className="py-3.5 px-4">DAY</th>
                  <th className="py-3.5 px-4">VIDEO</th>
                  <th className="py-3.5 px-4">ATTENDANCE TIME</th>
                  <th className="py-3.5 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                {paginatedAttendance.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Student */}
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs shrink-0">
                          {entry.studentName?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <span className="font-extrabold text-slate-900">{entry.studentName || 'Student'}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {entry.email || 'ramu@gmail.com'}
                    </td>

                    {/* Day Pill */}
                    <td className="py-4 px-4">
                      <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                        Day {entry.day}
                      </span>
                    </td>

                    {/* Video Title */}
                    <td className="py-4 px-4 font-bold text-slate-800">
                      {entry.videoTitle || `Day ${entry.day} Lecture`}
                    </td>

                    {/* Attendance Time */}
                    <td className="py-4 px-4 text-slate-400 font-medium">
                      {entry.watchedAt ? new Date(entry.watchedAt).toLocaleString('en-IN') : '18/7/2026, 8:25:36 pm'}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDeleteAttendanceEntry(entry.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls Footer (Requested by user) */}
        {totalAttendancePages > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-4">
              <span>
                Showing {filteredAttendanceEntries.length === 0 ? 0 : (attendancePage - 1) * attendancePerPage + 1} to {Math.min(attendancePage * attendancePerPage, filteredAttendanceEntries.length)} of {filteredAttendanceEntries.length} entries
              </span>

              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                <span>Show</span>
                <select
                  value={attendancePerPage}
                  onChange={(e) => {
                    setAttendancePerPage(Number(e.target.value));
                    setAttendancePage(1);
                  }}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>entries</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={attendancePage === 1}
                onClick={() => setAttendancePage(prev => Math.max(prev - 1, 1))}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
              >
                ‹ Prev
              </button>

              {Array.from({ length: totalAttendancePages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalAttendancePages || (p >= attendancePage - 1 && p <= attendancePage + 1))
                .map((p, idx, arr) => {
                  const prevVal = arr[idx - 1];
                  const showDots = prevVal && p - prevVal > 1;
                  return (
                    <React.Fragment key={p}>
                      {showDots && <span className="px-1 text-slate-400 font-bold">...</span>}
                      <button
                        type="button"
                        onClick={() => setAttendancePage(p)}
                        className={`h-9 w-9 rounded-xl text-xs font-black transition cursor-pointer ${
                          attendancePage === p
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                type="button"
                disabled={attendancePage === totalAttendancePages || totalAttendancePages === 0}
                onClick={() => setAttendancePage(prev => Math.min(prev + 1, totalAttendancePages))}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer"
              >
                Next ›
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
