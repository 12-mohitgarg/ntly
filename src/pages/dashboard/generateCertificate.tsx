import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export const generateCertificate = async (profile: any) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;

    // =========================
    // DEMO / DYNAMIC DATA
    // =========================

    const studentName = profile?.fullName || 'Rahul Kumar';
    const fatherName = profile?.fatherName || 'Ramesh Kumar';
    const registrationNo = profile?.registrationNo || 'IM20260001';
    const instituteName =
        profile?.collegeName || 'ABC Engineering College';

    const subject = profile?.internshipDomain || 'Web Development';

    const year = profile?.year || '2026';

    const startDate = profile?.startDate || '01 Jan 2026';
    const endDate = profile?.endDate || '30 Jan 2026';

    const totalHours =
        profile?.totalHoursCompleted || '120 Hours';

    const project =
        profile?.project ||
        'React.js, Node.js & Full Stack Development';

    // =========================
    // BACKGROUND
    // =========================

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Top Design
    doc.setFillColor(25, 25, 112);
    doc.rect(0, 0, pageWidth, 12, 'F');

    // Bottom Design
    doc.setFillColor(25, 25, 112);
    doc.rect(0, 285, pageWidth, 12, 'F');

    // Border
    doc.setDrawColor(60, 60, 60);
    doc.rect(5, 5, 200, 287);

    // =========================
    // HEADER
    // =========================

    doc.setFontSize(30);
    doc.setTextColor(30, 40, 120);
    doc.setFont('helvetica', 'bold');
    doc.text('InternMitra', 20, 28);

    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text('Learn Skills . Earn stipend', 21, 34);

    // Right Side Contact
    doc.setFontSize(10);
    doc.setTextColor(0);

    doc.text('www.internmitra.com', 145, 20);
    doc.text('9693921517, 9631185896', 145, 27);
    doc.text('info@internmitra.com', 145, 34);
    doc.text('Kisan Colony, Khagaul, Patna', 145, 41);

    // CIN
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('CIN : U78300BR2025PTC081140', 15, 48);

    // Line
    doc.line(10, 52, 200, 52);

    // =========================
    // TITLE
    // =========================

    doc.setTextColor(40, 40, 180);

    doc.setFontSize(18);
    doc.text(
        'INTERNSHIP COMPLETION CERTIFICATE',
        pageWidth / 2,
        60,
        {
            align: 'center'
        }
    );

    doc.line(10, 64, 200, 64);

    // =========================
    // REF NO
    // =========================

    doc.setTextColor(0);

    doc.setFontSize(12);

    doc.setFont('helvetica', 'normal');

    doc.text(
        'Letter Ref. No.:',
        10,
        72
    );

    doc.setFont('helvetica', 'bold');

    doc.text(
        'IM/2026/ICC/10000',
        45,
        72
    );

    doc.text(
        `Date: ${new Date().toLocaleDateString()}`,
        145,
        72
    );

    // =========================
    // BODY
    // =========================

    doc.setFont('helvetica', 'normal');

    doc.setFontSize(12);

    const bodyText = `
This is certify that Mr./Ms. ${studentName}. 
S/o or D/o ${fatherName}, bearing University Registration / Enrolment No. ${registrationNo} 
of ${instituteName}. Session ${year} with Major in ${subject}, 
has successfully completed his/her internship with InternMitra.
  `;

    const splitText = doc.splitTextToSize(bodyText, 180);

    doc.text(splitText, 10, 85);

    // Duration
    doc.setFont('helvetica', 'bold');

    doc.text(
        `Internship Duration: `,
        10,
        120
    );

    doc.setFont('helvetica', 'normal');

    doc.text(
        `From ${startDate} to ${endDate}`,
        58,
        120
    );

    // Hours
    doc.setFont('helvetica', 'bold');

    doc.text(
        `Total Hours Completed: `,
        10,
        128
    );

    doc.setFont('helvetica', 'normal');

    doc.text(
        `${totalHours}`,
        60,
        128
    );

    // Assessment Heading
    doc.setFont('helvetica', 'bold');

    doc.setFontSize(16);

    doc.text(
        'Internship Performance Assessment',
        10,
        145
    );

    // Project
    doc.setFontSize(12);

    doc.setFont('helvetica', 'normal');

    const projectText = `
During the internship, the student worked on ${project}. 
Based on our observation and mentorship, we assess the student's performance as follows
`;

    const splitProject = doc.splitTextToSize(
        projectText,
        180
    );

    doc.text(splitProject, 10, 155);

    // =========================
    // TABLE
    // =========================

    const startY = 175;

    const rows = [
        ['1', 'Technical Knowledge & Application', 'Outstanding'],
        ['2', 'Quality of Work & Task Completion', 'Good'],
        ['3', 'Initiative & Problem-Solving Ability', 'Outstanding'],
        ['4', 'Communication & Interpersonal Skills', 'Good'],
        ['5', 'Punctuality, Discipline & Professional Conduct', 'Outstanding']
    ];

    // Header
    doc.setFillColor(230, 230, 230);

    doc.rect(10, startY, 15, 15, 'FD');
    doc.rect(25, startY, 95, 15, 'FD');
    doc.rect(120, startY, 75, 15, 'FD');

    doc.text('S.No.', 14, startY + 9);

    doc.text(
        'Assessment Criteria',
        55,
        startY + 9
    );

    doc.text(
        'Rating',
        148,
        startY + 9
    );

    let y = startY + 15;

    rows.forEach((row) => {
        doc.rect(10, y, 15, 15);
        doc.rect(25, y, 95, 15);
        doc.rect(120, y, 75, 15);

        doc.text(row[0], 17, y + 9);

        doc.text(row[1], 28, y + 9);

        doc.text(row[2], 125, y + 9);

        y += 15;
    });

    // =========================
    // QR CODE
    // =========================

    const qrData = `
Name: ${studentName}
Course: ${subject}
Hours: ${totalHours}
`;

    const qrImage = await QRCode.toDataURL(qrData);

    doc.addImage(qrImage, 'PNG', 15, 255, 30, 30);

    // =========================
    // SIGNATURE
    // =========================

    doc.setFont('helvetica', 'bold');

    doc.text(
        'Mr. Amarjeet kumar',
        145,
        270
    );

    doc.setFont('helvetica', 'normal');

    doc.text(
        'Founder & CEO',
        155,
        277
    );

    // =========================
    // SAVE
    // =========================

    doc.save(
        `${studentName}_Internship_Certificate.pdf`
    );
};