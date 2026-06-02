import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export const generateAttendanceReport = (
  student: any,
  entries: AttendanceEntry[],
  filePrefix = 'InternMitra_Attendance'
) => {
  const sortedEntries = [...entries].sort((a, b) => a.day - b.day);
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
  doc.text(`Attendance Count: ${sortedEntries.length}`, 14, 74);

  autoTable(doc, {
    startY: 84,
    head: [['Day', 'Video Title', 'Attendance Date']],
    body: sortedEntries.map((entry) => [
      `Day ${entry.day}`,
      entry.videoTitle,
      new Date(entry.watchedAt).toLocaleString('en-IN')
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  doc.save(`${filePrefix}_${studentName.replace(/\s+/g, '_')}_${course.replace(/\s+/g, '_')}.pdf`);
};

export const generateCourseAttendanceReport = (
  course: string,
  entries: AttendanceEntry[]
) => {
  const sortedEntries = [...entries].sort((a, b) => {
    if (a.studentName !== b.studentName) return a.studentName.localeCompare(b.studentName);
    return a.day - b.day;
  });
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
  doc.text(`Total Attendance Entries: ${sortedEntries.length}`, 14, 55);

  autoTable(doc, {
    startY: 64,
    head: [['Student', 'Email', 'Day', 'Video Title', 'Attendance Date']],
    body: sortedEntries.map((entry) => [
      entry.studentName,
      entry.email || '-',
      `Day ${entry.day}`,
      entry.videoTitle,
      new Date(entry.watchedAt).toLocaleString('en-IN')
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  doc.save(`InternMitra_Course_Attendance_${course.replace(/\s+/g, '_')}.pdf`);
};
