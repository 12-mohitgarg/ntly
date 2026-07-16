import React, { useEffect, useState } from 'react';
import { addDoc, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Download, FileText, Upload, ClipboardList, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../components/AuthContext';
import { db } from '../../lib/firebase';
import { generateTestReport } from './generateTestReport';

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
  const [courseTest, setCourseTest] = useState<any>(null);
  const [testSubmission, setTestSubmission] = useState<any>(null);

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

        // Fetch test and submission if course exists
        if (profile?.internshipDomain) {
          const testRef = doc(db, 'courseTests', profile.internshipDomain);
          const testSnap = await getDoc(testRef);
          if (testSnap.exists()) {
            setCourseTest(testSnap.data());
          }

          if (user?.uid) {
            const subRef = doc(db, 'testSubmissions', `${user.uid}-${profile.internshipDomain}`);
            const subSnap = await getDoc(subRef);
            if (subSnap.exists()) {
              setTestSubmission(subSnap.data());
            }
          }
        }
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
    <div className="student-page">
      <header className="space-y-3">
        <span className="student-kicker">Performance</span>
        <h1 className="student-title">
          Academic <span className="gradient-text">Reports</span>
        </h1>
        <p className="student-subtitle">Track your assignment scores, test performance, and upload submissions.</p>
      </header>

      {testSubmission && (
        <div className="student-card p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 flex-shrink-0 border border-indigo-100 shadow-inner">
                <ClipboardList size={22} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block mb-0.5">Course Assessment</span>
                <h2 className="text-base font-black text-slate-900 truncate">Final Assessment Report</h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Attempted on {new Date(testSubmission.submittedAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Score</p>
                <p className="text-xl font-black text-indigo-600">{testSubmission.scorePercentage}%</p>
                <p className="text-xs font-semibold text-slate-500">
                  {testSubmission.correctCount} / {testSubmission.totalQuestions} Correct
                </p>
              </div>

              {courseTest && courseTest.questions && (
                <button
                  onClick={() => generateTestReport(profile, testSubmission, courseTest.questions)}
                  className="student-button-primary h-11 px-5 text-[10px]"
                >
                  <Download size={14} />
                  Download PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="student-card p-10 text-center">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Loading assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="student-card p-12 text-center border-dashed border-slate-200">
          <FileText size={40} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-base font-black text-slate-900">No assignment added yet</h2>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            Assignments will appear here once admin adds them.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="student-card p-5">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <h2 className="text-base font-black text-slate-900">{assignment.title}</h2>
                  {assignment.description && (
                    <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">{assignment.description}</p>
                  )}
                  {assignment.fileName && (
                    <p className="mt-2 truncate text-xs font-semibold text-slate-400">{assignment.fileName}</p>
                  )}
                </div>

                {assignment.fileUrl && (
                  <a
                    href={assignment.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="student-button-soft h-10 px-4 text-[10px]"
                  >
                    <Download size={14} />
                    Download
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="student-card p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-inner">
            <Upload size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block mb-0.5">Submit Assignment</span>
            <h2 className="text-base font-black text-slate-900">PDF Upload</h2>
          </div>
        </div>

        <form onSubmit={handleUploadStudentReport} className="grid gap-4">
          <div>
            <label className="student-label">Assignment</label>
            <select
              value={selectedAssignmentId}
              onChange={(event) => setSelectedAssignmentId(event.target.value)}
              disabled={assignments.length === 0 || uploading}
              className="student-input mt-2 h-12 px-4"
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
              className="student-input mt-2 h-12 px-4 py-2 text-xs"
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
            className="student-button-primary h-12 text-xs w-full sm:w-auto"
          >
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </button>
        </form>
      </div>

      {studentReports.length > 0 && (
        <div className="student-card p-6">
          <h2 className="mb-4 text-base font-black text-slate-900 uppercase tracking-wider">Your Uploaded Answers</h2>
          <div className="grid gap-3">
            {studentReports.map((submission) => (
              <div key={submission.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900">{getAssignmentTitle(submission)}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-500">{submission.fileName}</p>
                    <p className="mt-1 text-[10px] font-semibold text-slate-400">
                      {submission.uploadedAt
                        ? new Date(submission.uploadedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                        : 'Recent'}
                    </p>
                    {submission.description && (
                      <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">{submission.description}</p>
                    )}
                  </div>
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="student-button-soft h-10 px-4 text-[10px]"
                  >
                    <Download size={14} />
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
