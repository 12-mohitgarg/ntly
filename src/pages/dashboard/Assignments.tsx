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
    <div className="space-y-6">
      {studentReports.length > 0 && (
        <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
          <h2 className="mb-4 text-lg font-black text-slate-950">Your Uploaded Assignments</h2>
          <div className="grid gap-3">
            {studentReports.map((submission) => (
              <div key={submission.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">
                      {submission.assignmentTitle || submission.fileName}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {submission.fileName} • {formatDate(submission.uploadedAt)}
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

      {loading ? (
        <div className="rounded-3xl border border-white/70 bg-white/90 p-10 text-center shadow-xl shadow-slate-200/70">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Loading assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-12 text-center shadow-xl shadow-slate-200/60">
          <FileText size={46} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-lg font-black text-slate-900">No assignment uploaded yet</h2>
          <p className="mt-2 text-sm font-bold text-slate-500">
            Your {profile?.internshipDomain || 'selected course'} assignments will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-xl shadow-slate-200/70 backdrop-blur">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">
                      <BookOpen size={13} />
                      {assignment.course}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                      <Clock size={13} />
                      {formatDate(assignment.createdAt)}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-950">{assignment.title}</h2>
                  {assignment.description && (
                    <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{assignment.description}</p>
                  )}
                  {assignment.fileName && (
                    <p className="mt-2 truncate text-sm font-bold text-slate-500">{assignment.fileName}</p>
                  )}
                </div>

                {assignment.fileUrl ? (
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
                ) : (
                  <span className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-100 px-5 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
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
