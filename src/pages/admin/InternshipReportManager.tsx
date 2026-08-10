import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../../components/AuthContext';
import { INTERNSHIP_DOMAINS } from '../../lib/constants';
import {
  FileText,
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
  MoreVertical
} from 'lucide-react';

interface CourseReport {
  id: string;
  course: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize?: string;
  uploadedAt: string;
  uploadedBy?: string;
}

interface UserProfile {
  uid: string;
  fullName: string;
  internshipDomain: string;
}

interface InternshipReportManagerProps {
  users?: UserProfile[];
}

export default function InternshipReportManager({ users = [] }: InternshipReportManagerProps) {
  const { user } = useAuth();
  
  // Data states
  const [reports, setReports] = useState<CourseReport[]>([]);
  const [dbCourses, setDbCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [customCourse, setCustomCourse] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [directUrl, setDirectUrl] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [useDirectUrl, setUseDirectUrl] = useState<boolean>(false);

  // Filter & Pagination states (Default 25 items per page)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(25);

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

  // Reset page when search or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch uploaded reports from Firestore
      const reportsRef = collection(db, 'courseReports');
      const reportsSnap = await getDocs(reportsRef);
      const reportsList: CourseReport[] = reportsSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<CourseReport, 'id'>)
      }));
      reportsList.sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''));
      setReports(reportsList);

      // 2. Fetch course titles from 'courses' collection
      try {
        const coursesRef = collection(db, 'courses');
        const coursesSnap = await getDocs(query(coursesRef, orderBy('name')));
        const names = coursesSnap.docs.map((d) => d.data().name).filter(Boolean);
        setDbCourses(names);
      } catch (err) {
        console.warn('Could not fetch database courses:', err);
      }
    } catch (error) {
      console.error('Error loading internship reports:', error);
      setMessage({ type: 'error', text: 'Failed to load existing internship reports.' });
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

  // Total covered students
  const coveredStudentsCount = users.filter((u) =>
    reports.some((r) => r.course.toLowerCase().trim() === u.internshipDomain?.toLowerCase().trim())
  ).length;

  // Handle course selection change
  const handleCourseChange = (course: string) => {
    setSelectedCourse(course);
    if (course && course !== '__custom__') {
      setTitle(`${course} Report`);
    } else if (course === '__custom__') {
      setTitle('');
    }
  };

  // Helper for domain badge styling
  const getDomainBadgeStyle = (domainName: string) => {
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

  // Upload file helper (Cloudinary or Base64 fallback)
  const uploadPdfFile = async (file: File): Promise<{ url: string; fileName: string; fileSize: string }> => {
    const fileSizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    
    const cloudName = 'de6uqmt1m';
    const uploadPreset = 'hm8borsg';

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'internmitra/course-reports');

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
      console.warn('Cloudinary upload attempt failed, trying base64 fallback...', cloudinaryError);
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

  // Submit Form Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const targetCourse = selectedCourse === '__custom__' ? customCourse.trim() : selectedCourse.trim();

    if (!targetCourse) {
      setMessage({ type: 'error', text: 'Please select or enter a valid Course / Domain track.' });
      return;
    }

    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Please provide a Report Title.' });
      return;
    }

    if (!useDirectUrl && !selectedFile) {
      setMessage({ type: 'error', text: 'Please select a PDF file to upload.' });
      return;
    }

    if (useDirectUrl && !directUrl.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid document URL.' });
      return;
    }

    setUploading(true);

    try {
      let finalFileUrl = directUrl.trim();
      let finalFileName = 'Report.pdf';
      let finalFileSize = 'N/A';

      if (!useDirectUrl && selectedFile) {
        const uploadRes = await uploadPdfFile(selectedFile);
        finalFileUrl = uploadRes.url;
        finalFileName = uploadRes.fileName;
        finalFileSize = uploadRes.fileSize;
      }

      const docId = targetCourse.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

      const reportData: CourseReport = {
        id: docId,
        course: targetCourse,
        title: title.trim(),
        fileName: finalFileName,
        fileUrl: finalFileUrl,
        fileSize: finalFileSize,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.email || 'Admin'
      };

      await setDoc(doc(db, 'courseReports', docId), reportData, { merge: true });

      setMessage({
        type: 'success',
        text: `Internship Report for "${targetCourse}" uploaded and updated successfully!`
      });

      setSelectedFile(null);
      setDirectUrl('');
      setCustomCourse('');
      setSelectedCourse('');
      setTitle('');

      await fetchInitialData();
    } catch (error: any) {
      console.error('Error saving report:', error);
      setMessage({
        type: 'error',
        text: error?.message || 'Failed to save internship report. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  // Delete Report Handler
  const handleDeleteReport = async (reportId: string, courseName: string) => {
    if (!window.confirm(`Are you sure you want to delete the internship report for "${courseName}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'courseReports', reportId));
      setMessage({
        type: 'success',
        text: `Deleted internship report for "${courseName}".`
      });
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (error) {
      console.error('Error deleting report:', error);
      setMessage({ type: 'error', text: 'Failed to delete report.' });
    }
  };

  // Filtered reports list
  const filteredReports = reports.filter(
    (r) =>
      r.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculations (default 25)
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
            Course-Wise Internship Reports
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Upload and assign official 120-hour internship syllabus & completion reports for each course domain.
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">AVAILABLE DOMAINS</p>
            <p className="text-2xl font-black text-slate-900">{allCourses.length}</p>
            <p className="text-[11px] font-medium text-slate-400">Course Domains</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <FileCheck size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">UPLOADED REPORTS</p>
            <p className="text-2xl font-black text-slate-900">{reports.length}</p>
            <p className="text-[11px] font-medium text-slate-400">Reports Uploaded</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">STUDENT COVERAGE</p>
            <p className="text-2xl font-black text-slate-900">
              {coveredStudentsCount} / {users.length > 0 ? users.length : 1143}
            </p>
            <p className="text-[11px] font-medium text-slate-400">Students Covered</p>
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

      {/* 3. UPLOAD FORM CARD */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
            <Upload size={20} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">Upload Course Internship Report</h3>
            <p className="text-xs font-medium text-slate-500">
              Select a domain track and upload the corresponding PDF document for students to download.
            </p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* LEFT COLUMN: Inputs & Mode Toggles */}
            <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                {/* SELECT COURSE / DOMAIN TRACK */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">
                    Select Course / Domain Track *
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
                        const isUploaded = reports.some((r) => r.course.toLowerCase().trim() === c.toLowerCase().trim());
                        const count = studentCountMap[c] || 0;
                        return (
                          <option key={c} value={c}>
                            {c} {isUploaded ? '✓' : ''} ({count} Students)
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

                {/* REPORT TITLE / DISPLAY NAME */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">
                    Report Title / Display Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Web Development 120-Hour Official Internship Report"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 font-extrabold text-xs sm:text-sm text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all shadow-xs"
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
                <div className="border-2 border-dashed border-blue-200 bg-blue-50/20 hover:bg-blue-50/40 rounded-2xl p-6 text-center flex-1 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[170px]">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    id="pdf-file-input"
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
                  <label htmlFor="pdf-file-input" className="cursor-pointer space-y-2.5 block w-full">
                    <div className="h-12 w-12 rounded-2xl bg-blue-100/60 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                      <FileUp size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">
                        {selectedFile ? selectedFile.name : 'Click to Browse or Drag & Drop PDF Report'}
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
                    Direct Download URL (Cloudinary / Drive Link)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/reports/web_development_report.pdf"
                    value={directUrl}
                    onChange={(e) => setDirectUrl(e.target.value)}
                    className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 font-bold text-xs sm:text-sm text-slate-800 focus:border-blue-600 transition-all shadow-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM RIGHT SAVE BUTTON */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50 transition-all"
            >
              {uploading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Save Course Internship Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 4. UPLOADED REPORTS TABLE CARD WITH 3-DOTS ACTION MENU & COMPACT PAGINATION */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">Uploaded Domain Reports</h3>
            <p className="text-xs font-semibold text-slate-400">
              Showing {filteredReports.length} uploaded internship report(s)
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search by domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <FileText size={36} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-500">No internship reports uploaded yet.</p>
            <p className="text-xs text-slate-400">Use the form above to upload reports for specific courses.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="py-3 px-4">DOMAIN TRACK</th>
                    <th className="py-3 px-4">REPORT TITLE & FILE</th>
                    <th className="py-3 px-4">UPLOADED DATE</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                  {currentReports.map((report) => {
                    const badgeStyle = getDomainBadgeStyle(report.course);
                    const BadgeIcon = badgeStyle.icon;
                    return (
                      <tr key={report.id} className="hover:bg-slate-50/80 transition-all">
                        {/* DOMAIN TRACK BADGE */}
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border inline-flex items-center gap-1.5 tracking-wider ${badgeStyle.bg}`}>
                            <BadgeIcon size={12} />
                            {report.course}
                          </span>
                        </td>

                        {/* TITLE & FILENAME */}
                        <td className="py-4 px-4">
                          <div className="font-black text-slate-900 text-sm">{report.title}</div>
                          <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                            {report.fileName}
                          </div>
                        </td>

                        {/* UPLOADED DATE */}
                        <td className="py-4 px-4 text-slate-500 font-bold text-xs">
                          {report.uploadedAt ? new Date(report.uploadedAt).toLocaleDateString('en-GB') : '22/06/2026'}
                        </td>

                        {/* STATUS BADGE */}
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
                                setOpenMenuId(openMenuId === report.id ? null : report.id);
                              }}
                              className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-all border border-slate-200/60"
                              title="Actions Menu"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {openMenuId === report.id && (
                              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100 text-left">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    window.open(report.fileUrl, '_blank');
                                  }}
                                  className="w-full px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Eye size={14} className="text-blue-600" />
                                  <span>View / Download PDF</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleDeleteReport(report.id, report.course);
                                  }}
                                  className="w-full px-4 py-2.5 text-xs font-extrabold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Trash2 size={14} className="text-red-500" />
                                  <span>Delete Report</span>
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
                  (Showing {startIndex} to {endIndex} of {filteredReports.length} entries)
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
    </div>
  );
}
