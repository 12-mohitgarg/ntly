import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { BookOpen, Clock, Download, FileText } from 'lucide-react';
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

export default function Reports() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<CourseReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      if (!profile?.internshipDomain) {
        setReports([]);
        setLoading(false);
        return;
      }

      try {
        const reportsQuery = query(
          collection(db, 'courseReports'),
          where('course', '==', profile.internshipDomain)
        );
        const reportsSnapshot = await getDocs(reportsQuery);
        const courseReports = reportsSnapshot.docs
          .map((reportDoc) => ({ id: reportDoc.id, ...reportDoc.data() } as CourseReport))
          .sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''));

        setReports(courseReports);
      } catch (error) {
        console.error('Error fetching course reports:', error);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [profile?.internshipDomain]);

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
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-600">
            {profile?.internshipDomain || 'No course selected'}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/70 bg-white/90 p-10 text-center shadow-xl shadow-slate-200/70">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-12 text-center shadow-xl shadow-slate-200/60">
          <FileText size={46} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-lg font-black text-slate-900">No report uploaded yet</h2>
          <p className="mt-2 text-sm font-bold text-slate-500">
            Your {profile?.internshipDomain || 'selected course'} report will appear here once admin uploads it.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div key={report.id} className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-xl shadow-slate-200/70 backdrop-blur">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">
                      <BookOpen size={13} />
                      {report.course}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                      <Clock size={13} />
                      {report.uploadedAt
                        ? new Date(report.uploadedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                        : 'Recent'}
                    </span>
                  </div>
                  <h2 className="truncate text-lg font-black text-slate-950">{report.title}</h2>
                  <p className="mt-1 truncate text-sm font-bold text-slate-500">{report.fileName}</p>
                </div>

                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                >
                  <Download size={16} />
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
