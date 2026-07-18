import React, { useEffect, useMemo, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Download, History, Monitor, RefreshCw, ShieldCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { db } from '../../lib/firebase';
import { useAuth } from '../../components/AuthContext';
import { loadImageAsDataUrl } from '../../lib/offerLetterPdf';

type LoginLog = {
  id: string;
  userId: string;
  studentName?: string;
  email?: string;
  internshipDomain?: string;
  loggedAt?: { toDate?: () => Date };
  loginAtIso?: string;
  status?: string;
  userAgent?: string;
  platform?: string;
};

function getLogDate(log: LoginLog) {
  if (!log) return null;
  if (log.loggedAt?.toDate) return log.loggedAt.toDate();
  if (log.loginAtIso) return new Date(log.loginAtIso);
  return null;
}

function getBrowser(userAgent = '') {
  if (/Edg\//.test(userAgent)) return 'Edge';
  if (/Chrome\//.test(userAgent)) return 'Chrome';
  if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) return 'Safari';
  if (/Firefox\//.test(userAgent)) return 'Firefox';
  return 'Browser';
}

export default function LogBook() {
  const { user, profile } = useAuth();
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      const aTime = getLogDate(a)?.getTime() || 0;
      const bTime = getLogDate(b)?.getTime() || 0;
      return bTime - aTime;
    });
  }, [logs]);

  const fetchLogs = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const userSnapshot = await getDoc(doc(db, 'users', user.uid));
      const userData = userSnapshot.exists() ? userSnapshot.data() : profile;
      setLogs(((userData?.loginLogs || []) as LoginLog[]).map((log, index) => ({
        ...log,
        id: log.id || `${log.loginAtIso || 'login'}-${index}`,
        userId: log.userId || user.uid
      })));
    } catch (error) {
      console.error('Error fetching login logs:', error);
      setLogs(((profile?.loginLogs || []) as LoginLog[]).map((log, index) => ({
        ...log,
        id: log.id || `${log.loginAtIso || 'login'}-${index}`,
        userId: log.userId || user.uid
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user?.uid, profile?.loginLogs]);

  const downloadReport = async () => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210;
    const H = 297;
    const ML = 14;
    const MR = 14;
    const name = profile?.fullName || 'Student';
    const generatedAt = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    try {
      const [headerImg, footerImg] = await Promise.all([
        loadImageAsDataUrl('/logbook_header.png'),
        loadImageAsDataUrl('/receipt_footer.png', 'image/jpeg')
      ]);
      const headerH = (247 / 1246) * W;
      pdf.addImage(headerImg, 'PNG', 0, 0, W, headerH);
      pdf.addImage(footerImg, 'JPEG', 0, H - 13, W, 13);
    } catch (error) {
      console.warn('Unable to load log book PDF assets:', error);
      pdf.setFillColor(22, 101, 52);
      pdf.rect(0, 0, W, 26, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.text('InternMitra', ML, 16);
    }

    let y = 52;
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(17);
    pdf.text('STUDENT LOGIN LOG BOOK', W / 2, y, { align: 'center' });
    y += 10;

    pdf.setFillColor(239, 246, 255);
    pdf.setDrawColor(191, 219, 254);
    pdf.roundedRect(ML, y, W - ML - MR, 30, 2, 2, 'FD');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text('Student Name', ML + 4, y + 8);
    pdf.text('Email', ML + 4, y + 17);
    pdf.text('Internship Domain', 112, y + 8);
    pdf.text('Generated At', 112, y + 17);
    pdf.setFont('Helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text(name, ML + 36, y + 8);
    pdf.text(profile?.email || user?.email || '-', ML + 36, y + 17);
    pdf.text(profile?.internshipDomain || '-', 145, y + 8);
    pdf.text(generatedAt, 145, y + 17);
    y += 42;

    pdf.setFontSize(10);
    pdf.setTextColor(30, 64, 175);
    pdf.text(`Total Login Entries: ${sortedLogs.length}`, ML, y);
    const lastLogin = getLogDate(sortedLogs[0]);
    pdf.text(`Last Login: ${lastLogin ? lastLogin.toLocaleString('en-IN') : 'N/A'}`, W - MR, y, { align: 'right' });
    y += 9;

    const columns = ['#', 'Date', 'Time', 'Browser', 'Status'];
    const widths = [12, 42, 34, 54, 40];
    pdf.setFillColor(30, 64, 175);
    pdf.rect(ML, y - 5, W - ML - MR, 8, 'F');
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    let x = ML + 2;
    columns.forEach((column, index) => {
      pdf.text(column, x, y);
      x += widths[index];
    });
    y += 7;

    sortedLogs.forEach((log, index) => {
      if (y > H - 26) {
        pdf.addPage();
        y = 24;
      }

      const date = getLogDate(log);
      if (index % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(ML, y - 5, W - ML - MR, 8, 'F');
      }

      const values = [
        String(index + 1),
        date ? date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
        date ? date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-',
        `${getBrowser(log.userAgent)} / ${log.platform || 'Web'}`,
        log.status || 'Success'
      ];

      pdf.setFont('Helvetica', index === 0 ? 'bold' : 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(15, 23, 42);
      x = ML + 2;
      values.forEach((value, valueIndex) => {
        const clipped = pdf.splitTextToSize(value, widths[valueIndex] - 3)[0] || '';
        pdf.text(clipped, x, y);
        x += widths[valueIndex];
      });
      y += 8;
    });

    if (sortedLogs.length === 0) {
      pdf.setTextColor(100, 116, 139);
      pdf.setFont('Helvetica', 'normal');
      pdf.text('No login entries found yet.', ML + 2, y);
    }

    pdf.save(`InternMitra_Log_Book_${name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="student-page">
      <header className="student-card overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="student-kicker">Activity Records</p>
            <h1 className="student-title mt-2">Login Log Book</h1>
            <p className="student-subtitle">Your official sign-in history for internship access and participation tracking.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={fetchLogs} className="student-button-soft">
              <RefreshCw size={16} />
              Refresh
            </button>
            <button onClick={downloadReport} className="student-button-primary">
              <Download size={16} />
              Download PDF
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="student-card p-5">
          <History className="mb-4 text-blue-600" size={24} />
          <p className="student-label">Total Logins</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{sortedLogs.length}</p>
        </div>
        <div className="student-card p-5">
          <ShieldCheck className="mb-4 text-emerald-600" size={24} />
          <p className="student-label">Latest Status</p>
          <p className="mt-2 text-xl font-black text-slate-950">{sortedLogs[0]?.status || 'No Entry'}</p>
        </div>
        <div className="student-card p-5">
          <Monitor className="mb-4 text-slate-700" size={24} />
          <p className="student-label">Last Browser</p>
          <p className="mt-2 text-xl font-black text-slate-950">{getBrowser(sortedLogs[0]?.userAgent)}</p>
        </div>
      </div>

      <section className="student-card overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-black text-slate-950">Recent Login Entries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Browser</th>
                <th className="px-5 py-3">Platform</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm font-bold text-slate-400">Loading log book...</td>
                </tr>
              ) : sortedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm font-bold text-slate-400">No login entries found yet.</td>
                </tr>
              ) : (
                sortedLogs.map((log) => {
                  const date = getLogDate(log);
                  return (
                    <tr key={log.id} className="text-sm text-slate-700 hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {date ? date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-500">
                        {date ? date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-5 py-4 font-semibold">{getBrowser(log.userAgent)}</td>
                      <td className="px-5 py-4 text-slate-500">{log.platform || 'Web'}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                          {log.status || 'Success'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
