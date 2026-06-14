import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { INTERNSHIP_DOMAINS } from '../../lib/constants';
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
  const { adminProfile } = useAuth();
  const [videos, setVideos] = useState<DailyVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState<DailyVideo | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntry[]>([]);
  const [courseStudents, setCourseStudents] = useState<AttendanceStudent[]>([]);
  const [formData, setFormData] = useState({
    day: 1,
    title: '',
    youtubeUrl: '',
    description: '',
    course: ''
  });
  const isTeacher = adminProfile?.role === 'teacher';
  const assignedCourse = adminProfile?.course || '';

  useEffect(() => {
    if (isTeacher) {
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
        const nextDay = maxDay < 15 ? maxDay + 1 : 15;
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
    const regex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

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
        // Update existing video
        await setDoc(doc(db, 'dailyVideos', editingVideo.id), {
          ...formData,
          youtubeVideoId: videoId,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } else {
        // Check if day already exists for this course
        const existingVideo = videos.find(v => v.day === formData.day);
        if (existingVideo) {
          alert(`Day ${formData.day} already has a video for ${formData.course}. Please edit or delete it first.`);
          return;
        }

        // Create new video
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
      day: videos.length + 1 > 15 ? 1 : videos.length + 1,
      title: '',
      youtubeUrl: '',
      description: '',
      course: selectedCourse
    });
  };

  return (
    <div className="space-y-8">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-[3rem] text-white shadow-2xl shadow-blue-600/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Video size={24} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">Daily Videos</h1>
            </div>
            <p className="text-white/80 font-bold italic flex items-center gap-2">
              <Sparkles size={16} />
              Manage 15-day learning video schedule for students
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Label className="text-white font-bold">Select Course:</Label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={isTeacher}
              className={`h-12 px-6 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-white/50 ${isTeacher ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
            >
              <option value="" className="text-slate-900">{isTeacher ? 'No course assigned' : '-- Select Course --'}</option>
              {INTERNSHIP_DOMAINS.map((course) => (
                <option key={course} value={course} className="text-slate-900">{course}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {!selectedCourse && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-[2rem] p-8 text-center shadow-xl"
        >
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video size={32} className="text-yellow-600" />
          </div>
          <p className="text-yellow-700 font-black italic text-lg">Please select a course to manage videos</p>
        </motion.div>
      )}

      {/* Add/Edit Form */}
      {selectedCourse && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${editingVideo ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
              {editingVideo ? <Edit2 size={24} /> : <Plus size={24} />}
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase italic">
              {editingVideo ? 'Edit Video' : 'Add New Video'}
            </h2>
            <div className="mb-4">
              {courseCompleted ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    className="bg-green-600 text-white px-5 py-2 rounded-lg"
                    disabled
                  >
                    Course Completed
                  </button>
                  <button
                    onClick={() => generateCourseAttendanceReport(selectedCourse, attendanceEntries, courseStudents, videos)}
                    className="bg-slate-900 text-white px-5 py-2 rounded-lg"
                  >
                    Generate Attendance Report
                  </button>
                </div>
              ) : (
                <button
                  onClick={markCourseCompleted}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg"
                >
                  Mark Course As Done
                </button>
              )}
            </div>
            <span className="bg-blue-100 text-blue-600 text-xs font-black px-4 py-2 rounded-full uppercase ml-auto">
              {selectedCourse}
            </span>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-slate-700 font-bold mb-2 block">Day (1-20)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    max="15"
                    value={formData.day}
                    disabled
                    className="mt-0 bg-gradient-to-r from-slate-100 to-slate-50 border-slate-200 font-black text-slate-900"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Clock size={18} />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  Auto-calculated based on existing videos
                </p>
              </div>
              <div>
                <Label className="text-slate-700 font-bold mb-2 block">Video Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter video title"
                  className="mt-0 border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-700 font-bold mb-2 block">YouTube URL</Label>
              <div className="relative">
                <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />
                <Input
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="mt-0 pl-12 border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-700 font-bold mb-2 block">Description (Optional)</Label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the video content"
                className="mt-0 w-full p-4 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none resize-none transition-all"
                rows={3}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl shadow-blue-600/20 flex-1"
              >
                <Save size={20} className="mr-2" />
                {editingVideo ? 'Update Video' : 'Add Video'}
              </Button>
              {editingVideo && (
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                >
                  <X size={20} className="mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Videos List */}
      {selectedCourse && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 uppercase italic">Current Schedule</h2>
            <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-slate-600">{videos.length} / 15 videos</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                <Video size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-bold italic">Loading videos...</p>
            </div>
          ) : videos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-[2rem] p-12 text-center"
            >
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video size={36} className="text-slate-400" />
              </div>
              <p className="text-slate-600 font-black italic text-lg mb-2">No videos added yet</p>
              <p className="text-slate-400 font-bold">Start by adding Day 1 video for {selectedCourse}</p>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-xl hover:shadow-2xl hover:border-blue-200 transition-all duration-300 flex items-center gap-6 group"
                >
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                      <Youtube size={32} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xs border-4 border-white shadow-lg">
                      {video.day}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase shadow-md">
                        Day {video.day}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 truncate">{video.title}</h3>
                    </div>
                    {video.description && (
                      <p className="text-slate-500 text-sm truncate mb-1">{video.description}</p>
                    )}
                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-xs font-bold hover:underline truncate block"
                    >
                      {video.youtubeUrl}
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(video)}
                      variant="outline"
                      size="icon"
                      className="border-slate-200 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <Edit2 size={18} />
                    </Button>
                    <Button
                      onClick={() => handleDelete(video.id)}
                      variant="outline"
                      size="icon"
                      className="border-slate-200 hover:border-red-600 hover:text-red-600 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* {selectedCourse && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase italic">Attendance Entries</h2>
              <p className="text-slate-500 text-sm font-bold">{selectedCourse}</p>
            </div>
            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-xs font-black uppercase">
              {attendanceEntries.length} Entries
            </span>
          </div>

          {attendanceEntries.length === 0 ? (
            <div className="p-10 text-center text-slate-500 font-bold">
              No attendance entries yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Student</th>
                    <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Email</th>
                    <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Day</th>
                    <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Video</th>
                    <th className="text-left p-4 text-xs font-black uppercase tracking-wider text-slate-500">Attendance Time</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-black text-slate-900">{entry.studentName}</td>
                      <td className="p-4 text-slate-600">{entry.email || '-'}</td>
                      <td className="p-4 text-slate-600 font-bold">Day {entry.day}</td>
                      <td className="p-4 text-slate-600">{entry.videoTitle}</td>
                      <td className="p-4 text-slate-600 text-sm">
                        {new Date(entry.watchedAt).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )} */}
    </div>
  );
}
