import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

export interface QuizSubmission {
  userId: string;
  studentName: string;
  email: string;
  course: string;
  answers: Record<string, number>;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  scorePercentage: number;
  submittedAt: string;
}

const loadImage = (src: string) => {
  return new Promise<string>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      }
    };
    img.src = src;
  });
};

export const generateTestReport = async (
  student: any,
  submission: QuizSubmission,
  questions: QuizQuestion[]
) => {
  const docPDF = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;
  const ML = 14;

  // Load template images
  const headerImg = await loadImage('/ii.png');
  const footerImg = await loadImage('/ff.png');
  const watermarkImg = await loadImage('/dded.jpeg');

  // Fetch certificate number
  let certificateNumber = '10000';
  if (submission.userId) {
    try {
      const userDocRef = doc(db, 'users', submission.userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data() as any;
        if (userData?.certificateNumber) {
          certificateNumber = userData.certificateNumber;
        }
      }
    } catch (e) {
      console.error('Error fetching certificate number for marksheet:', e);
    }
  }

  // Header image
  const headerH = (252 / 998) * W;
  docPDF.addImage(headerImg, 'PNG', 0, 0, W, headerH);

  // Watermark
  const wmSize = 90;
  const wmX = (W - wmSize) / 2;
  const wmY = (H - wmSize) / 2;
  (docPDF as any).saveGraphicsState();
  (docPDF as any).setGState((docPDF as any).GState({ opacity: 0.10 }));
  docPDF.addImage(watermarkImg, 'JPEG', wmX, wmY, wmSize, wmSize);
  (docPDF as any).restoreGraphicsState();

  // Footer image at the bottom
  const footerH = (322 / 1002) * W;
  docPDF.addImage(footerImg, 'PNG', 0, H - footerH, W, footerH);

  // Mask the left portion of the footer image to make background white for CEO signature
  docPDF.setFillColor(255, 255, 255);
  docPDF.rect(0, H - footerH, 115, footerH - 12, 'F');

  // Draw signature line, name and CEO text dynamically on the left side
  docPDF.setDrawColor(15, 23, 42);
  docPDF.setLineWidth(0.35);
  docPDF.line(ML + 6, H - footerH + 14, ML + 76, H - footerH + 14);

  docPDF.setFont('Helvetica', 'bold');
  docPDF.setFontSize(10.5);
  docPDF.setTextColor(15, 23, 42);
  docPDF.text('Mr. Amarjeet kumar', ML + 41, H - footerH + 19, { align: 'center' });

  docPDF.setFont('Helvetica', 'normal');
  docPDF.setFontSize(9.5);
  docPDF.setTextColor(30, 41, 59);
  docPDF.text('Founder & CEO', ML + 41, H - footerH + 24, { align: 'center' });

  let y = headerH + 5;

  // Letter Ref + Date
  docPDF.setFontSize(8.5);
  docPDF.setTextColor(15, 23, 42);

  docPDF.setFont('Helvetica', 'bold');
  docPDF.text('CIN : U78300BR2025PTC081140', ML, y);
  y += 5;

  // Dashed line top
  docPDF.setDrawColor(156, 163, 175);
  docPDF.setLineWidth(0.3);
  docPDF.setLineDashPattern([1.5, 1.5], 0);
  docPDF.line(ML, y, W - ML, y);
  y += 5;

  // Assessment title
  docPDF.setFontSize(13);
  docPDF.setFont('Helvetica', 'bold');
  docPDF.setTextColor(30, 64, 175); // Royal blue
  docPDF.text('INTERNSHIP ASSESSMENT MARKSHEET', W / 2, y, { align: 'center' });
  y += 3;

  // Dashed line bottom
  docPDF.line(ML, y, W - ML, y);
  y += 6;

  // Reset line dash pattern to solid
  docPDF.setLineDashPattern([], 0);

  // Student details table
  const semesterStr = student?.semester
    ? (student.semester.toLowerCase().includes('semester') ? student.semester : `${student.semester} SEMESTER`)
    : '5th SEMESTER';

  const deptStr = student?.department || 'B.Sc.';
  const domainStr = student?.internshipDomain || submission.course || 'Web Development';

  autoTable(docPDF, {
    startY: y,
    body: [
      ['STUDENT NAME', submission.studentName],
      ['COLLEGE NAME', student?.college || 'N/A'],
      ['UNIVERSITY ROLL NO.', student?.universityRoll || 'N/A'],
      ['SEMESTER', semesterStr.toUpperCase()],
      ['DEPARTMENT', deptStr.toUpperCase()],
      ['INTERNSHIP TOPIC', domainStr.toUpperCase()]
    ],
    theme: 'grid',
    styles: { fontSize: 9.5, fontStyle: 'bold', font: 'Helvetica', cellPadding: 3.0, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 55, textColor: [30, 41, 59] },
      1: { cellWidth: 127, textColor: [15, 23, 42], halign: 'center' }
    },
    tableLineColor: [100, 116, 139],
    tableLineWidth: 0.3
  });

  const tableEndY = (docPDF as any).lastAutoTable.finalY || y + 40;
  y = tableEndY + 4;

  // Assessment result header
  docPDF.setFontSize(11);
  docPDF.setFont('Helvetica', 'bold');
  docPDF.setTextColor(15, 23, 42);
  docPDF.text('ASSESSMENT RESULT', ML, y);
  y += 3.5;

  // Assessment result box
  const resultBoxY = y;
  const resultBoxH = 26;
  docPDF.setDrawColor(203, 213, 225); // slate-200
  docPDF.setLineWidth(0.4);
  docPDF.roundedRect(ML, resultBoxY, W - 2 * ML, resultBoxH, 2, 2, 'D');

  // Draw thick blue vertical line at the left side
  docPDF.setDrawColor(22, 28, 166);
  docPDF.setLineWidth(1.5);
  docPDF.setLineCap('round');
  docPDF.line(ML + 0.6, resultBoxY + 1.2, ML + 0.6, resultBoxY + resultBoxH - 1.2);

  // Score stats calculations
  const score = submission.scorePercentage;
  let testGrade = 'F';
  if (score >= 90) testGrade = 'A+';
  else if (score >= 80) testGrade = 'A';
  else if (score >= 70) testGrade = 'B+';
  else if (score >= 60) testGrade = 'B';
  else if (score >= 50) testGrade = 'C+';
  else if (score >= 40) testGrade = 'C';
  else if (score >= 33) testGrade = 'D';

  const isPassed = score >= 33;

  docPDF.setFont('Helvetica', 'bold');
  docPDF.setFontSize(10);
  docPDF.setTextColor(30, 41, 59);

  const textX = ML + 6;
  const valX = W - ML - 6;

  docPDF.text('SCORE PERCENTAGE', textX, resultBoxY + 7);
  docPDF.text(`[${score}%]`, valX, resultBoxY + 7, { align: 'right' });

  docPDF.text('GRADE', textX, resultBoxY + 14);
  docPDF.text(`[${testGrade}]`, valX, resultBoxY + 14, { align: 'right' });

  docPDF.text('STATUS', textX, resultBoxY + 21);
  docPDF.text(isPassed ? '[PASSED]' : '[FAILED]', valX, resultBoxY + 21, { align: 'right' });

  y = resultBoxY + resultBoxH + 4;

  // Grade Distribution Pill
  docPDF.setFillColor(22, 28, 166);
  docPDF.roundedRect(ML, y, 42, 6, 2, 2, 'F');
  docPDF.setFont('Helvetica', 'bold');
  docPDF.setFontSize(8);
  docPDF.setTextColor(255, 255, 255);
  docPDF.text('GRADE DISTRIBUTION', ML + 21, y + 4.2, { align: 'center' });

  y += 9.5;

  // Grade distribution header
  docPDF.setFontSize(8.5);
  docPDF.setFont('Helvetica', 'bold');
  docPDF.setTextColor(15, 23, 42);
  docPDF.text('GRADE', ML, y);
  docPDF.text('PERCENTAGE', ML + 18, y);
  docPDF.text('MARKS', ML + 44, y);
  y += 4.5;

  const gradesData = [
    ['A+', '90%-100%', '90-100'],
    ['A', '80%-89%', '80-89'],
    ['B+', '70%-79%', '70-79'],
    ['B', '60%-69%', '60-69'],
    ['C+', '50%-59%', '50-59'],
    ['C', '40%-49%', '40-49'],
    ['D', '33%-39%', '33-39'],
    ['F', 'Below 33%', '0-32']
  ];

  docPDF.setFont('Helvetica', 'normal');
  docPDF.setTextColor(51, 65, 85);
  gradesData.forEach(([g, pct, mrk]) => {
    docPDF.setFont('Helvetica', 'bold');
    docPDF.text('•', ML, y);
    docPDF.text(g, ML + 3, y);
    docPDF.setFont('Helvetica', 'normal');
    docPDF.text(pct, ML + 18, y);
    docPDF.text(mrk, ML + 44, y);
    y += 4.0;
  });

  // Save PDF
  const filename = `InternMitra_Assessment_Marksheet_${submission.studentName.replace(/\s+/g, '_')}_${submission.course.replace(/\s+/g, '_')}.pdf`;
  docPDF.save(filename);
};
