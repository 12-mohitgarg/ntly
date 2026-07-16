import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { BookOpen, Clock, Download, FileText } from 'lucide-react';
import { useAuth } from '../../components/AuthContext';
import { db } from '../../lib/firebase';

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

interface StudentReport {
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
  cloudinaryPublicId?: string;
  uploadedAt?: string;
}

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentReports, setStudentReports] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  const normalizeCourseName = (value?: string) => value?.trim().toLowerCase() || '';

  const formatDate = (value?: string) =>
    value
      ? new Date(value).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
      : 'Recent';

  useEffect(() => {
    const fetchAssignments = async () => {
      const studentCourse = normalizeCourseName(profile?.internshipDomain);

      if (!user?.uid || !studentCourse) {
        setAssignments([]);
        setStudentReports([]);
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

        const submissionsQuery = query(
          collection(db, 'studentReports'),
          where('userId', '==', user.uid)
        );
        const submissionsSnapshot = await getDocs(submissionsQuery);
        const submissions = submissionsSnapshot.docs
          .map((submissionDoc) => ({ id: submissionDoc.id, ...submissionDoc.data() } as StudentReport))
          .filter((submission) => normalizeCourseName(submission.course) === studentCourse)
          .sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''));

        setStudentReports(submissions);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        setAssignments([]);
        setStudentReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [profile?.internshipDomain, user?.uid]);

  return (
    <div className="student-page">
      <header className="space-y-3">
        <span className="student-kicker">Workspace</span>
        <h1 className="student-title">
          Internship <span className="gradient-text">Reports</span>
        </h1>
        <p className="student-subtitle">
          View your domain assignments, upload reports, and check your submission timeline.
        </p>
      </header>

      {studentReports.length > 0 && (
        <div className="student-card p-6">
          <h2 className="mb-4 text-base font-black text-slate-950 uppercase tracking-wider">Your Uploaded Assignments</h2>
          <div className="grid gap-3">
            {studentReports.map((submission) => (
              <div key={submission.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">
                      {submission.assignmentTitle || submission.fileName}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {submission.fileName} • {formatDate(submission.uploadedAt)}
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

      {loading ? (
        <div className="student-card p-10 text-center">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Loading assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="student-card p-12 text-center border-dashed border-slate-200">
          <FileText size={40} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-base font-black text-slate-900">No assignment uploaded yet</h2>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            Your {profile?.internshipDomain || 'selected course'} assignments will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="student-card p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-indigo-700">
                      <BookOpen size={10} />
                      {assignment.course}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
                      <Clock size={10} />
                      {formatDate(assignment.createdAt)}
                    </span>
                  </div>
                  <h2 className="text-base font-black text-slate-900">{assignment.title}</h2>
                  {assignment.description && (
                    <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">{assignment.description}</p>
                  )}
                  {assignment.fileName && (
                    <p className="mt-2 truncate text-xs font-semibold text-slate-400">{assignment.fileName}</p>
                  )}
                </div>

                {assignment.fileUrl ? (
                  <a
                    href={assignment.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="student-button-primary h-10 px-4 text-[10px]"
                  >
                    <Download size={14} />
                    Download
                  </a>
                ) : (
                  <span className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-100 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500 border border-slate-200">
                    Instructions Only
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
