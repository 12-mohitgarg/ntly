import React, { useEffect, useState } from 'react';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Download, FileText, Upload } from 'lucide-react';
import { useAuth } from '../../components/AuthContext';
import { db } from '../../lib/firebase';

interface CourseReport {
  id: string;
  title: string;
  course: string;
  fileName: string;
  fileUrl: string;
  uploadedAt?: string;
}

interface StudentReport {
  id: string;
  userId: string;
  studentName: string;
  email: string;
  course?: string;
  assignmentId?: string;
  assignmentTitle?: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  cloudinaryPublicId?: string;
  uploadedAt?: string;
}

interface Assignment {
  id: string;
  title: string;
  course: string;
  description?: string;
  fileName?: string;
  fileUrl?: string;
  createdAt?: string;
  isActive?: boolean;
}

export default function Reports() {
  const { user, profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentReports, setStudentReports] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const normalizeCourseName = (value?: string) => value?.trim().toLowerCase() || '';

  const fetchStudentReports = async (courseAssignments: Assignment[]) => {
    if (!user?.uid) {
      setStudentReports([]);
      return;
    }

    const studentCourse = normalizeCourseName(profile?.internshipDomain);
    const courseAssignmentIds = new Set(courseAssignments.map((assignment) => assignment.id));
    const submissionsQuery = query(
      collection(db, 'studentReports'),
      where('userId', '==', user.uid)
    );
    const submissionsSnapshot = await getDocs(submissionsQuery);
    const submissions = submissionsSnapshot.docs
      .map((submissionDoc) => ({ id: submissionDoc.id, ...submissionDoc.data() } as StudentReport))
      .filter((submission) =>
        normalizeCourseName(submission.course) === studentCourse ||
        Boolean(submission.assignmentId && courseAssignmentIds.has(submission.assignmentId))
      )
      .sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''));

    setStudentReports(submissions);
  };

  useEffect(() => {
    const fetchReports = async () => {
      const studentCourse = normalizeCourseName(profile?.internshipDomain);

      if (!studentCourse) {
        setAssignments([]);
        setStudentReports([]);
        setSelectedAssignmentId('');
        setLoading(false);
        return;
      }

      try {
        const assignmentsSnapshot = await getDocs(collection(db, 'assignments'));
        const courseAssignments = assignmentsSnapshot.docs
          .map((assignmentDoc) => ({ id: assignmentDoc.id, ...assignmentDoc.data() } as Assignment))
          .filter((assignment) =>
            assignment.isActive !== false &&
            normalizeCourseName(assignment.course) === studentCourse
          )
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

        setAssignments(courseAssignments);
        setSelectedAssignmentId((currentAssignmentId) => {
          if (currentAssignmentId && courseAssignments.some((assignment) => assignment.id === currentAssignmentId)) {
            return currentAssignmentId;
          }

          return courseAssignments[0]?.id || '';
        });
        await fetchStudentReports(courseAssignments).catch((studentReportError) => {
          console.error('Error fetching student uploaded reports:', studentReportError);
          setStudentReports([]);
        });
      } catch (error) {
        console.error('Error fetching assignments:', error);
        setAssignments([]);
        setStudentReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [profile?.internshipDomain, user?.uid]);

  const handleUploadStudentReport = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user?.uid) {
      alert('Please login before uploading.');
      return;
    }

    const selectedAssignment = assignments.find((assignment) => assignment.id === selectedAssignmentId);

    if (!selectedAssignment) {
      alert('Please select an assignment before uploading.');
      return;
    }

    if (!selectedFile) {
      alert('Please select a PDF file.');
      return;
    }

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF files are allowed.');
      return;
    }

    const cloudName = 'de6uqmt1m';
    const uploadPreset = 'hm8borsg';

    if (!cloudName || !uploadPreset) {
      alert('Cloudinary credentials are missing. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.');
      return;
    }
      
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', `internmitra/student-reports/${selectedAssignment.course.replace(/[^a-z0-9-]+/gi, '-').toLowerCase()}`);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Cloudinary upload failed');
      }

      const uploadResult = await response.json();

      const uploadedReport = {
        userId: user.uid,
        studentName: profile?.fullName || user.displayName || 'Student',
        email: profile?.email || user.email || '',
        course: selectedAssignment.course,
        assignmentId: selectedAssignment.id,
        assignmentTitle: selectedAssignment.title,
        description: description.trim(),
        fileName: selectedFile.name,
        fileUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        uploadedAt: new Date().toISOString()
      };

      let reportDoc;
      try {
        reportDoc = await addDoc(collection(db, 'studentReports'), uploadedReport);
      } catch (firestoreError: any) {
        if (firestoreError?.code !== 'permission-denied') {
          throw firestoreError;
        }

        reportDoc = await addDoc(collection(db, 'submissions'), {
          ...uploadedReport,
          type: 'studentReport'
        });
      }

      setSelectedFile(null);
      setDescription('');
      setFileInputKey((key) => key + 1);
      setStudentReports((currentReports) => [
        { id: reportDoc.id, ...uploadedReport },
        ...currentReports
      ]);
      alert('PDF uploaded successfully.');
    } catch (error: any) {
      console.error('Error uploading student report:', error);
      alert(error?.message || 'Error uploading PDF.');
    } finally {
      setUploading(false);
    }
  };

  const getAssignmentTitle = (submission: StudentReport) =>
    submission.assignmentTitle ||
    assignments.find((assignment) => assignment.id === submission.assignmentId)?.title ||
    'Legacy upload';

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <FileText size={24} />
            </div>
            <div>
              <p className="student-kicker text-blue-600">Course Report</p>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">Reports</h1>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/70 bg-white/90 p-10 text-center shadow-xl shadow-slate-200/70">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Loading assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-12 text-center shadow-xl shadow-slate-200/60">
          <FileText size={46} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-lg font-black text-slate-900">No assignment added yet</h2>
          <p className="mt-2 text-sm font-bold text-slate-500">
            Assignments will appear here once admin adds them.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-xl shadow-slate-200/70 backdrop-blur">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <h2 className="text-lg font-black text-slate-950">{assignment.title}</h2>
                  {assignment.description && (
                    <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{assignment.description}</p>
                  )}
                  {assignment.fileName && (
                    <p className="mt-2 truncate text-sm font-bold text-slate-500">{assignment.fileName}</p>
                  )}
                </div>

                {assignment.fileUrl && (
                  <a
                    href={assignment.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                  >
                    <Download size={16} />
                    Download
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Upload size={24} />
          </div>
          <div>
            <p className="student-kicker text-emerald-600">Submit Assignment</p>
            <h2 className="text-xl font-black tracking-tight text-slate-950">PDF Upload</h2>
          </div>
        </div>

        <form onSubmit={handleUploadStudentReport} className="grid gap-4">
          <div>
            <label className="student-label">Assignment</label>
            <select
              value={selectedAssignmentId}
              onChange={(event) => setSelectedAssignmentId(event.target.value)}
              disabled={assignments.length === 0 || uploading}
              className="student-input mt-2"
            >
              <option value="">Select assignment</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="student-label">PDF File</label>
            <input
              key={fileInputKey}
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
              className="student-input mt-2"
            />
          </div>
          <div>
            <label className="student-label">Description (optional)</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Write a short note for admin"
              className="student-input mt-2 min-h-28 py-3"
            />
          </div>
          <button
            type="submit"
            disabled={uploading || assignments.length === 0}
            className="student-button-primary inline-flex h-12 items-center justify-center gap-2 px-5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </button>
        </form>
      </div>

      {studentReports.length > 0 && (
        <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
          <h2 className="mb-4 text-lg font-black text-slate-950">Your Uploaded Answers</h2>
          <div className="grid gap-3">
            {studentReports.map((submission) => (
              <div key={submission.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900">{getAssignmentTitle(submission)}</p>
                    <p className="mt-1 truncate text-sm font-bold text-slate-600">{submission.fileName}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {submission.uploadedAt
                        ? new Date(submission.uploadedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                        : 'Recent'}
                    </p>
                    {submission.description && (
                      <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{submission.description}</p>
                    )}
                  </div>
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-slate-800"
                  >
                    <Download size={15} />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    
    </div>
  );
}
