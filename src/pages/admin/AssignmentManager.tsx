import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../../components/AuthContext';
import { INTERNSHIP_DOMAINS } from '../../lib/constants';
import {
  ClipboardList,
  Upload,
  Trash2,
  Eye,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Layers,
  FileCheck,
  ShieldCheck,
  X,
  FileUp,
  Sparkles,
  Link as LinkIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  UserCheck,
  MoreVertical
} from 'lucide-react';

interface AssignmentItem {
  id: string;
  course: string;
  title: string;
  description?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: string;
  dueDate?: string;
  createdAt: string;
  createdBy?: string;
  isActive?: boolean;
}

interface StudentSubmission {
  id: string;
  userId: string;
  studentName: string;
  email: string;
  course: string;
  assignmentId?: string;
  assignmentTitle?: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  uploadedAt?: string;
  sourceCollection?: string;
}

interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  internshipDomain: string;
}

interface AssignmentManagerProps {
  users?: UserProfile[];
}

export default function AssignmentManager({ users = [] }: AssignmentManagerProps) {
  const { user } = useAuth();

  // Active view tab inside manager: 'assignments' | 'submissions'
  const [activeSubTab, setActiveSubTab] = useState<'assignments' | 'submissions'>('assignments');

  // Data states
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [studentSubmissions, setStudentSubmissions] = useState<StudentSubmission[]>([]);
  const [dbCourses, setDbCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states (for creating an assignment)
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [customCourse, setCustomCourse] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [directUrl, setDirectUrl] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [useDirectUrl, setUseDirectUrl] = useState<boolean>(false);

  // Filter & Pagination states for Assignments Tab (Default 25)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(25);

  // Filter & Pagination states for Submissions Tab (Default 25)
  const [subSearchQuery, setSubSearchQuery] = useState<string>('');
  const [subCourseFilter, setSubCourseFilter] = useState<string>('');
  const [subCurrentPage, setSubCurrentPage] = useState<number>(1);
  const [subItemsPerPage, setSubItemsPerPage] = useState<number>(25);

  // Action Menu state (3-dots dropdown)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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

  // Fetch data on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  useEffect(() => {
    setSubCurrentPage(1);
  }, [subSearchQuery, subCourseFilter, subItemsPerPage]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch created assignments from Firestore 'assignments' collection
      try {
        const assignmentsRef = collection(db, 'assignments');
        const assignmentsSnap = await getDocs(assignmentsRef);
        const list: AssignmentItem[] = assignmentsSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<AssignmentItem, 'id'>)
        }));
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setAssignments(list);
      } catch (err) {
        console.warn('Could not fetch assignments:', err);
      }

      // 2. Fetch student submissions from 'studentReports' and 'submissions' collections
      const submissionsList: StudentSubmission[] = [];
      
      try {
        const studentReportsRef = collection(db, 'studentReports');
        const studentReportsSnap = await getDocs(studentReportsRef);
        studentReportsSnap.docs.forEach((docSnap) => {
          submissionsList.push({
            id: docSnap.id,
            sourceCollection: 'studentReports',
            ...(docSnap.data() as Omit<StudentSubmission, 'id'>)
          });
        });
      } catch (err) {
        console.warn('Could not fetch studentReports:', err);
      }

      try {
        const genericSubmissionsRef = collection(db, 'submissions');
        const genericSubmissionsSnap = await getDocs(genericSubmissionsRef);
        genericSubmissionsSnap.docs.forEach((docSnap) => {
          if (!submissionsList.some((s) => s.id === docSnap.id)) {
            submissionsList.push({
              id: docSnap.id,
              sourceCollection: 'submissions',
              ...(docSnap.data() as Omit<StudentSubmission, 'id'>)
            });
          }
        });
      } catch (err) {
        console.warn('Could not fetch submissions:', err);
      }

      submissionsList.sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''));
      setStudentSubmissions(submissionsList);

      // 3. Fetch courses list from 'courses' collection
      try {
        const coursesRef = collection(db, 'courses');
        const coursesSnap = await getDocs(query(coursesRef, orderBy('name')));
        const names = coursesSnap.docs.map((d) => d.data().name).filter(Boolean);
        setDbCourses(names);
      } catch (err) {
        console.warn('Could not fetch database courses:', err);
      }
    } catch (error) {
      console.error('Error loading assignments data:', error);
      setMessage({ type: 'error', text: 'Failed to load assignments and student submissions.' });
    } finally {
      setLoading(false);
    }
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

  // Combine course options
  const allCourses = Array.from(
    new Set([
      ...INTERNSHIP_DOMAINS,
      ...dbCourses,
      ...users.map((u) => u.internshipDomain).filter(Boolean)
    ])
  ).sort();

  // Count enrolled students per course
  const studentCountMap = users.reduce<Record<string, number>>((acc, u) => {
    if (u.internshipDomain) {
      acc[u.internshipDomain] = (acc[u.internshipDomain] || 0) + 1;
    }
    return acc;
  }, {});

  // Handle course dropdown change
  const handleCourseChange = (course: string) => {
    setSelectedCourse(course);
    if (course && course !== '__custom__') {
      setTitle(`${course} Practical Assignment`);
    } else if (course === '__custom__') {
      setTitle('');
    }
  };

  // Helper for domain badge styling
  const getDomainBadgeStyle = (domainName?: string) => {
    if (!domainName) return { bg: 'bg-blue-50 text-blue-600 border-blue-100', icon: Layers };
    const d = domainName.toLowerCase();
    if (d.includes('teacher')) return { bg: 'bg-blue-50 text-blue-600 border-blue-100', icon: BookOpen };
    if (d.includes('digital') || d.includes('personality')) return { bg: 'bg-purple-50 text-purple-600 border-purple-100', icon: Sparkles };
    if (d.includes('graphics') || d.includes('content') || d.includes('media')) return { bg: 'bg-orange-50 text-orange-600 border-orange-100', icon: Layers };
    if (d.includes('entrepreneur')) return { bg: 'bg-cyan-50 text-cyan-600 border-cyan-100', icon: ShieldCheck };
    if (d.includes('web') || d.includes('software') || d.includes('tech')) return { bg: 'bg-sky-50 text-sky-600 border-sky-100', icon: FileText };
    if (d.includes('security') || d.includes('cyber')) return { bg: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: ShieldCheck };
    if (d.includes('financial') || d.includes('business')) return { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2 };
    if (d.includes('health') || d.includes('medical')) return { bg: 'bg-rose-50 text-rose-600 border-rose-100', icon: Sparkles };
    return { bg: 'bg-blue-50 text-blue-600 border-blue-100', icon: Layers };
  };

  // Upload PDF file helper (Cloudinary or FileReader fallback)
  const uploadPdfFile = async (file: File): Promise<{ url: string; fileName: string; fileSize: string }> => {
    const fileSizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    const cloudName = 'de6uqmt1m';
    const uploadPreset = 'hm8borsg';

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'internmitra/assignments');

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        if (result.secure_url) {
          return {
            url: result.secure_url,
            fileName: file.name,
            fileSize: fileSizeFormatted
          };
        }
      }
    } catch (cloudinaryError) {
      console.warn('Cloudinary upload failed, using base64 fallback...', cloudinaryError);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          fileName: file.name,
          fileSize: fileSizeFormatted
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Form submit handler for creating a new Assignment
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const targetCourse = selectedCourse === '__custom__' ? customCourse.trim() : selectedCourse.trim();

    if (!targetCourse) {
      setMessage({ type: 'error', text: 'Please select or enter a valid Course / Domain track.' });
      return;
    }

    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Please provide an Assignment Title.' });
      return;
    }

    if (!useDirectUrl && !selectedFile) {
      setMessage({ type: 'error', text: 'Please select an assignment PDF file to upload.' });
      return;
    }

    if (useDirectUrl && !directUrl.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid document URL.' });
      return;
    }

    setUploading(true);

    try {
      let finalFileUrl = directUrl.trim();
      let finalFileName = 'Assignment.pdf';
      let finalFileSize = 'N/A';

      if (!useDirectUrl && selectedFile) {
        const uploadRes = await uploadPdfFile(selectedFile);
        finalFileUrl = uploadRes.url;
        finalFileName = uploadRes.fileName;
        finalFileSize = uploadRes.fileSize;
      }

      const docId = `assignment_${Date.now()}_${targetCourse.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}`;

      const assignmentData: AssignmentItem = {
        id: docId,
        course: targetCourse,
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || undefined,
        fileName: finalFileName,
        fileUrl: finalFileUrl,
        fileSize: finalFileSize,
        createdAt: new Date().toISOString(),
        createdBy: user?.email || 'Admin',
        isActive: true
      };

      await setDoc(doc(db, 'assignments', docId), assignmentData, { merge: true });

      setMessage({
        type: 'success',
        text: `Assignment "${title}" for "${targetCourse}" published successfully!`
      });

      setSelectedFile(null);
      setDirectUrl('');
      setCustomCourse('');
      setSelectedCourse('');
      setTitle('');
      setDescription('');
      setDueDate('');

      await fetchInitialData();
    } catch (error: any) {
      console.error('Error saving assignment:', error);
      setMessage({
        type: 'error',
        text: error?.message || 'Failed to publish assignment. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  // Delete Assignment Handler
  const handleDeleteAssignment = async (assignmentId: string, titleText: string) => {
    if (!window.confirm(`Are you sure you want to delete the assignment "${titleText}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'assignments', assignmentId));
      setMessage({ type: 'success', text: `Deleted assignment "${titleText}".` });
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setMessage({ type: 'error', text: 'Failed to delete assignment.' });
    }
  };

  // Delete Student Submission Handler
  const handleDeleteSubmission = async (submission: StudentSubmission) => {
    if (!window.confirm(`Are you sure you want to delete the submission by "${submission.studentName}"?`)) {
      return;
    }

    try {
      const colName = submission.sourceCollection || 'studentReports';
      await deleteDoc(doc(db, colName, submission.id));
      setMessage({ type: 'success', text: `Deleted submission by "${submission.studentName}".` });
      setStudentSubmissions((prev) => prev.filter((s) => s.id !== submission.id));
    } catch (error) {
      console.error('Error deleting submission:', error);
      setMessage({ type: 'error', text: 'Failed to delete submission.' });
    }
  };

  // Filtering for Assignments Tab
  const filteredAssignments = assignments.filter(
    (a) =>
      a.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.fileName && a.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPagesAssignments = Math.ceil(filteredAssignments.length / itemsPerPage) || 1;
  const startIndexAssignments = filteredAssignments.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndexAssignments = Math.min(currentPage * itemsPerPage, filteredAssignments.length);
  const currentAssignments = filteredAssignments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Filtering for Submissions Tab
  const filteredSubmissions = studentSubmissions.filter((sub) => {
    const matchesSearch =
      sub.studentName.toLowerCase().includes(subSearchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(subSearchQuery.toLowerCase()) ||
      sub.course.toLowerCase().includes(subSearchQuery.toLowerCase()) ||
      (sub.assignmentTitle && sub.assignmentTitle.toLowerCase().includes(subSearchQuery.toLowerCase())) ||
      sub.fileName.toLowerCase().includes(subSearchQuery.toLowerCase());

    const matchesCourse = !subCourseFilter || sub.course.toLowerCase().trim() === subCourseFilter.toLowerCase().trim();
    return matchesSearch && matchesCourse;
  });

  const totalPagesSubmissions = Math.ceil(filteredSubmissions.length / subItemsPerPage) || 1;
  const startIndexSubmissions = filteredSubmissions.length === 0 ? 0 : (subCurrentPage - 1) * subItemsPerPage + 1;
  const endIndexSubmissions = Math.min(subCurrentPage * subItemsPerPage, filteredSubmissions.length);
  const currentSubmissions = filteredSubmissions.slice((subCurrentPage - 1) * subItemsPerPage, subCurrentPage * subItemsPerPage);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider">
            ADMIN CONTROL CENTER
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
            Course Assignments & Student Submissions
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Upload course-wise practical assignments and review student submission files in real time.
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

      {/* 2. TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ClipboardList size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ACTIVE ASSIGNMENTS</p>
            <p className="text-2xl font-black text-slate-900">{assignments.length}</p>
            <p className="text-[11px] font-medium text-slate-400">Published Course Tasks</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <FileCheck size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">STUDENT SUBMISSIONS</p>
            <p className="text-2xl font-black text-slate-900">{studentSubmissions.length}</p>
            <p className="text-[11px] font-medium text-slate-400">Total Submissions Received</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">SUBMITTING STUDENTS</p>
            <p className="text-2xl font-black text-slate-900">
              {Array.from(new Set(studentSubmissions.map((s) => s.userId))).length}
            </p>
            <p className="text-[11px] font-medium text-slate-400">Unique Active Students</p>
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

      {/* 3. MANAGER NAVIGATION TABS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-b border-slate-200/80 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('assignments')}
          className={`h-11 px-6 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'assignments'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ClipboardList size={16} />
          <span>1. Manage Course Assignments ({assignments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('submissions')}
          className={`h-11 px-6 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'submissions'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileCheck size={16} />
          <span>2. Student Submissions Review ({studentSubmissions.length})</span>
        </button>
      </div>

      {/* VIEW 1: COURSE ASSIGNMENTS (UPLOAD & TABLE) */}
      {activeSubTab === 'assignments' && (
        <div className="space-y-6">
          {/* UPLOAD FORM CARD */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                <Upload size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">Upload New Course Assignment</h3>
                <p className="text-xs font-medium text-slate-500">
                  Assign a domain task or project PDF for enrolled students to download and submit.
                </p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* LEFT COLUMN: Form Inputs */}
                <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* SELECT COURSE / DOMAIN TRACK */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">
                        Target Course / Domain Track *
                      </label>
                      <div className="relative">
                        <select
                          value={selectedCourse}
                          onChange={(e) => handleCourseChange(e.target.value)}
                          required
                          className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 pr-10 font-bold text-xs sm:text-sm text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all appearance-none cursor-pointer shadow-xs"
                        >
                          <option value="">-- Choose Internship Domain --</option>
                          {allCourses.map((c) => {
                            const count = studentCountMap[c] || 0;
                            return (
                              <option key={c} value={c}>
                                {c} ({count} Students)
                              </option>
                            );
                          })}
                          <option value="__custom__">+ Enter Custom Domain Name...</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>

                    {/* CUSTOM DOMAIN INPUT */}
                    {selectedCourse === '__custom__' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">
                          Custom Domain Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Artificial Intelligence & ML"
                          value={customCourse}
                          onChange={(e) => setCustomCourse(e.target.value)}
                          required
                          className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 font-bold text-xs sm:text-sm text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all shadow-xs"
                        />
                      </div>
                    )}

                    {/* ASSIGNMENT TITLE & DUE DATE ROW */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">
                          Assignment Title *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Web Development Module 1 Practical Project"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                          className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 font-extrabold text-xs sm:text-sm text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all shadow-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">
                          Due Date / Deadline
                        </label>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 font-bold text-xs sm:text-sm text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    {/* DESCRIPTION / INSTRUCTIONS */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">
                        Instructions / Description (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Complete the responsive layout exercise and submit your final PDF report."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 font-medium text-xs text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  {/* MODE BUTTONS ROW */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setUseDirectUrl(false)}
                      className={`h-11 px-5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
                        !useDirectUrl
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <Upload size={15} />
                      <span>Upload PDF File</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUseDirectUrl(true)}
                      className={`h-11 px-5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
                        useDirectUrl
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <LinkIcon size={15} />
                      <span>Enter Direct PDF URL</span>
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: Drag & Drop Box */}
                <div className="lg:col-span-5 flex flex-col">
                  {!useDirectUrl ? (
                    <div className="border-2 border-dashed border-blue-200 bg-blue-50/20 hover:bg-blue-50/40 rounded-2xl p-6 text-center flex-1 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[190px]">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        id="assignment-pdf-input"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                              alert('Only PDF files are allowed.');
                              return;
                            }
                            setSelectedFile(file);
                          }
                        }}
                        className="hidden"
                      />
                      <label htmlFor="assignment-pdf-input" className="cursor-pointer space-y-2.5 block w-full">
                        <div className="h-12 w-12 rounded-2xl bg-blue-100/60 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                          <FileUp size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">
                            {selectedFile ? selectedFile.name : 'Click to Browse or Drag & Drop Assignment PDF'}
                          </p>
                          <p className="text-xs font-semibold text-slate-400 mt-1">
                            {selectedFile
                              ? `File size: ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                              : 'Accepts PDF files up to 25MB'}
                          </p>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-6 flex-1 flex flex-col justify-center space-y-2">
                      <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">
                        Direct PDF Download URL (Cloudinary / Drive Link)
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com/assignments/web_dev_assignment.pdf"
                        value={directUrl}
                        onChange={(e) => setDirectUrl(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 font-bold text-xs sm:text-sm text-slate-800 focus:border-blue-600 transition-all shadow-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {uploading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Publishing Assignment...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Save & Publish Assignment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* CREATED ASSIGNMENTS TABLE CARD WITH COMPACT PAGINATION */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">Published Course Assignments</h3>
                <p className="text-xs font-semibold text-slate-400">
                  Showing {filteredAssignments.length} course assignment(s)
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {filteredAssignments.length === 0 ? (
              <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <ClipboardList size={36} className="mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-500">No course assignments published yet.</p>
                <p className="text-xs text-slate-400">Use the form above to create assignments for students.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto min-h-[300px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-3 px-4">DOMAIN TRACK</th>
                        <th className="py-3 px-4">ASSIGNMENT TITLE & ATTACHMENT</th>
                        <th className="py-3 px-4">DUE DATE</th>
                        <th className="py-3 px-4">STATUS</th>
                        <th className="py-3 px-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                      {currentAssignments.map((assignment) => {
                        const badgeStyle = getDomainBadgeStyle(assignment.course);
                        const BadgeIcon = badgeStyle.icon;
                        return (
                          <tr key={assignment.id} className="hover:bg-slate-50/80 transition-all">
                            {/* DOMAIN TRACK */}
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border inline-flex items-center gap-1.5 tracking-wider ${badgeStyle.bg}`}>
                                <BadgeIcon size={12} />
                                {assignment.course}
                              </span>
                            </td>

                            {/* TITLE & FILE */}
                            <td className="py-4 px-4">
                              <div className="font-black text-slate-900 text-sm">{assignment.title}</div>
                              {assignment.description && (
                                <div className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                                  {assignment.description}
                                </div>
                              )}
                              <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-2">
                                <span>📄 {assignment.fileName || 'Assignment.pdf'}</span>
                                {assignment.fileSize && (
                                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px]">
                                    {assignment.fileSize}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* DUE DATE */}
                            <td className="py-4 px-4 text-slate-600 font-bold text-xs">
                              {assignment.dueDate ? (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-100">
                                  <Calendar size={12} />
                                  {new Date(assignment.dueDate).toLocaleDateString('en-GB')}
                                </span>
                              ) : (
                                <span className="text-slate-400">No deadline set</span>
                              )}
                            </td>

                            {/* STATUS */}
                            <td className="py-4 px-4">
                              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-emerald-100 inline-flex items-center gap-1.5 tracking-wider">
                                <CheckCircle2 size={12} />
                                ACTIVE FOR STUDENTS
                              </span>
                            </td>

                            {/* 3-DOTS ACTION MENU */}
                            <td className="py-4 px-4 text-right">
                              <div className="relative inline-block text-left action-menu-container">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(openMenuId === assignment.id ? null : assignment.id);
                                  }}
                                  className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-all border border-slate-200/60"
                                  title="Actions Menu"
                                >
                                  <MoreVertical size={16} />
                                </button>

                                {openMenuId === assignment.id && (
                                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100 text-left">
                                    {assignment.fileUrl && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenuId(null);
                                          window.open(assignment.fileUrl, '_blank');
                                        }}
                                        className="w-full px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer transition-colors"
                                      >
                                        <Eye size={14} className="text-blue-600" />
                                        <span>View Assignment PDF</span>
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        handleDeleteAssignment(assignment.id, assignment.title);
                                      }}
                                      className="w-full px-4 py-2.5 text-xs font-extrabold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                                    >
                                      <Trash2 size={14} className="text-red-500" />
                                      <span>Delete Assignment</span>
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
                      (Showing {startIndexAssignments} to {endIndexAssignments} of {filteredAssignments.length} entries)
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

                    {getPaginationRange(currentPage, totalPagesAssignments).map((pageItem, idx) => {
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
                      disabled={currentPage === totalPagesAssignments || totalPagesAssignments === 0}
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPagesAssignments))}
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
        </div>
      )}

      {/* VIEW 2: STUDENT SUBMISSIONS REVIEW */}
      {activeSubTab === 'submissions' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">Submitted Student Practical Assignments</h3>
              <p className="text-xs font-semibold text-slate-400">
                Review PDF files uploaded by enrolled students for their course tasks.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Filter by course */}
              <select
                value={subCourseFilter}
                onChange={(e) => setSubCourseFilter(e.target.value)}
                className="h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 transition-all cursor-pointer w-full sm:w-48"
              >
                <option value="">All Course Domains</option>
                {allCourses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search student or file..."
                  value={subSearchQuery}
                  onChange={(e) => setSubSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 transition-all"
                />
              </div>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-3">
              <FileCheck size={36} className="mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-500">No student submissions found.</p>
              <p className="text-xs text-slate-400">Student assignment submission uploads will appear here in real time.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="py-3 px-4">STUDENT NAME & EMAIL</th>
                      <th className="py-3 px-4">COURSE DOMAIN</th>
                      <th className="py-3 px-4">ASSIGNMENT & SUBMITTED FILE</th>
                      <th className="py-3 px-4">SUBMISSION DATE</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                    {currentSubmissions.map((sub) => {
                      const badgeStyle = getDomainBadgeStyle(sub.course);
                      const BadgeIcon = badgeStyle.icon;
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/80 transition-all">
                          {/* STUDENT DETAILS */}
                          <td className="py-4 px-4">
                            <div className="font-black text-slate-900 text-sm">{sub.studentName || 'Student'}</div>
                            <div className="text-[11px] text-slate-400 font-medium">{sub.email || 'N/A'}</div>
                          </td>

                          {/* COURSE DOMAIN */}
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border inline-flex items-center gap-1.5 tracking-wider ${badgeStyle.bg}`}>
                              <BadgeIcon size={12} />
                              {sub.course || 'General'}
                            </span>
                          </td>

                          {/* ASSIGNMENT & FILE */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-800">
                              {sub.assignmentTitle || 'Course Assignment Project'}
                            </div>
                            <div className="text-[11px] text-blue-600 font-extrabold flex items-center gap-1 mt-0.5">
                              <FileText size={12} />
                              <span>{sub.fileName || 'Submission.pdf'}</span>
                            </div>
                            {sub.description && (
                              <div className="text-[11px] text-slate-400 font-medium mt-0.5 italic">
                                "{sub.description}"
                              </div>
                            )}
                          </td>

                          {/* DATE */}
                          <td className="py-4 px-4 text-slate-500 font-bold text-xs">
                            {sub.uploadedAt ? new Date(sub.uploadedAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </td>

                          {/* STATUS */}
                          <td className="py-4 px-4">
                            <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-teal-100 inline-flex items-center gap-1.5 tracking-wider">
                              <CheckCircle2 size={12} />
                              SUBMITTED
                            </span>
                          </td>

                          {/* 3-DOTS ACTION MENU */}
                          <td className="py-4 px-4 text-right">
                            <div className="relative inline-block text-left action-menu-container">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === sub.id ? null : sub.id);
                                }}
                                className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-all border border-slate-200/60"
                                title="Actions Menu"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {openMenuId === sub.id && (
                                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100 text-left">
                                  {sub.fileUrl && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuId(null);
                                        window.open(sub.fileUrl, '_blank');
                                      }}
                                      className="w-full px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer transition-colors"
                                    >
                                      <Eye size={14} className="text-blue-600" />
                                      <span>Review / Download PDF</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      handleDeleteSubmission(sub);
                                    }}
                                    className="w-full px-4 py-2.5 text-xs font-extrabold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                                  >
                                    <Trash2 size={14} className="text-red-500" />
                                    <span>Delete Submission</span>
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

              {/* COMPACT PAGINATION CONTROLS FOR SUBMISSIONS */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <span>Show</span>
                  <select
                    value={subItemsPerPage}
                    onChange={(e) => setSubItemsPerPage(Number(e.target.value))}
                    className="h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-800 cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>entries</span>
                  <span className="text-slate-400 font-semibold ml-2 hidden md:inline">
                    (Showing {startIndexSubmissions} to {endIndexSubmissions} of {filteredSubmissions.length} submissions)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <button
                    type="button"
                    disabled={subCurrentPage === 1}
                    onClick={() => setSubCurrentPage((p) => Math.max(p - 1, 1))}
                    className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-slate-700 cursor-pointer font-extrabold"
                  >
                    <ChevronLeft size={14} />
                    <span>Previous</span>
                  </button>

                  {getPaginationRange(subCurrentPage, totalPagesSubmissions).map((pageItem, idx) => {
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
                        onClick={() => setSubCurrentPage(pageNum)}
                        className={`h-8 w-8 rounded-lg text-xs font-black cursor-pointer transition-all ${
                          subCurrentPage === pageNum
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
                    disabled={subCurrentPage === totalPagesSubmissions || totalPagesSubmissions === 0}
                    onClick={() => setSubCurrentPage((p) => Math.min(p + 1, totalPagesSubmissions))}
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
      )}
    </div>
  );
}
