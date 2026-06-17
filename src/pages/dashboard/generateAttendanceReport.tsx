import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { COURSE_VIDEO_DAY_LIMIT } from '../../lib/constants';

export interface AttendanceEntry {
  id?: string;
  userId: string;
  studentName: string;
  email?: string;
  course: string;
  day: number;
  videoId: string;
  videoTitle: string;
  watchedAt: string;
}

export interface AttendanceVideo {
  day: number;
  title?: string;
}

export interface AttendanceStudent {
  id?: string;
  uid?: string;
  fullName?: string;
  email?: string;
  college?: string;
}

const DEFAULT_ATTENDANCE_DAYS = COURSE_VIDEO_DAY_LIMIT;

const getReportDays = (videos: AttendanceVideo[] = []) => {
  const videoDays = videos
    .map((video) => Number(video.day))
    .filter((day) => Number.isFinite(day) && day > 0);

  if (videoDays.length > 0) {
    return [...new Set(videoDays)].sort((a, b) => a - b);
  }

  return Array.from({ length: DEFAULT_ATTENDANCE_DAYS }, (_, index) => index + 1);
};

const getVideoTitle = (day: number, videos: AttendanceVideo[], entry?: AttendanceEntry) => {
  return entry?.videoTitle || videos.find((video) => Number(video.day) === day)?.title || '-';
};

export const generateAttendanceReport = (
  student: any,
  entries: AttendanceEntry[],
  videos: AttendanceVideo[] = [],
  filePrefix = 'InternMitra_Attendance'
) => {
  const sortedEntries = [...entries].sort((a, b) => a.day - b.day);
  const entryByDay = new Map(sortedEntries.map((entry) => [Number(entry.day), entry]));
  const days = getReportDays(videos);
  const presentCount = days.filter((day) => entryByDay.has(day)).length;
  const absentCount = days.length - presentCount;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const course = student?.internshipDomain || sortedEntries[0]?.course || 'Course';
  const studentName = student?.fullName || sortedEntries[0]?.studentName || 'Student';

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('INTERNMITRA ATTENDANCE REPORT', 105, 15, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.text(studentName, 14, 42);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Course: ${course}`, 14, 50);
  doc.text(`Email: ${student?.email || sortedEntries[0]?.email || '-'}`, 14, 56);
  doc.text(`College: ${student?.college || '-'}`, 14, 62);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 68);
  doc.text(`Present: ${presentCount}   Absent: ${absentCount}`, 14, 74);

  autoTable(doc, {
    startY: 84,
    head: [['Day', 'Video Title', 'Status', 'Attendance Date']],
    body: days.map((day) => {
      const entry = entryByDay.get(day);

      return [
        `Day ${day}`,
        getVideoTitle(day, videos, entry),
        entry ? 'Present' : 'Absent',
        entry ? new Date(entry.watchedAt).toLocaleString('en-IN') : '-'
      ];
    }),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  doc.save(`${filePrefix}_${studentName.replace(/\s+/g, '_')}_${course.replace(/\s+/g, '_')}.pdf`);
};

export const generateCourseAttendanceReport = (
  course: string,
  entries: AttendanceEntry[],
  students: AttendanceStudent[] = [],
  videos: AttendanceVideo[] = []
) => {
  const sortedEntries = [...entries].sort((a, b) => {
    if (a.studentName !== b.studentName) return a.studentName.localeCompare(b.studentName);
    return a.day - b.day;
  });
  const days = getReportDays(videos);
  const studentsById = new Map<string, AttendanceStudent>();

  students.forEach((student) => {
    const id = student.uid || student.id;
    if (id) studentsById.set(id, student);
  });

  sortedEntries.forEach((entry) => {
    if (!studentsById.has(entry.userId)) {
      studentsById.set(entry.userId, {
        id: entry.userId,
        fullName: entry.studentName,
        email: entry.email
      });
    }
  });

  const reportStudents = [...studentsById.entries()].sort(([, a], [, b]) =>
    (a.fullName || '').localeCompare(b.fullName || '')
  );
  const entryByStudentAndDay = new Map(
    sortedEntries.map((entry) => [`${entry.userId}-${Number(entry.day)}`, entry])
  );
  const presentCount = sortedEntries.length;
  const totalExpected = reportStudents.length * days.length;
  const absentCount = Math.max(totalExpected - presentCount, 0);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 297, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('INTERNMITRA COURSE ATTENDANCE REPORT', 148, 15, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.text(course || 'Course', 14, 40);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 48);
  doc.text(`Present: ${presentCount}   Absent: ${absentCount}`, 14, 55);

  autoTable(doc, {
    startY: 64,
    head: [['Student', 'Email', 'Day', 'Video Title', 'Status', 'Attendance Date']],
    body: reportStudents.flatMap(([studentId, student]) =>
      days.map((day) => {
        const entry = entryByStudentAndDay.get(`${studentId}-${day}`);

        return [
          student.fullName || entry?.studentName || 'Student',
          student.email || entry?.email || '-',
          `Day ${day}`,
          getVideoTitle(day, videos, entry),
          entry ? 'Present' : 'Absent',
          entry ? new Date(entry.watchedAt).toLocaleString('en-IN') : '-'
        ];
      })
    ),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  doc.save(`InternMitra_Course_Attendance_${course.replace(/\s+/g, '_')}.pdf`);
};
