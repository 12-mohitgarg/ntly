import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { db } from '../../lib/firebase';

import {
    doc,
    getDoc,
    updateDoc,
    runTransaction
} from 'firebase/firestore';

export const generateCertificate = async (
    profile: any,
    userId: string
) => {

    // =========================
    // CERTIFICATE NUMBER
    // =========================

    const getCertificateNumber = async (): Promise<string> => {

        if (!userId) {
            throw new Error('User ID missing');
        }

        const userDoc = await getDoc(
            doc(db, 'users', userId)
        );

        const userData = userDoc.data();

        // already exists
        if (userData?.certificateNumber) {
            return userData.certificateNumber;
        }

        // sequential counter
        const counterRef = doc(
            db,
            'counters',
            'certificate'
        );

        const nextNumber = await runTransaction(
            db,
            async (transaction) => {

                const counterDoc =
                    await transaction.get(counterRef);

                // first time
                if (!counterDoc.exists()) {

                    transaction.set(counterRef, {
                        count: 10001,
                        lastUpdated:
                            new Date().toISOString()
                    });

                    return 10001;
                }

                const currentCount =
                    counterDoc.data().count;

                const newCount =
                    currentCount + 1;

                transaction.update(counterRef, {
                    count: newCount,
                    lastUpdated:
                        new Date().toISOString()
                });

                return newCount;
            }
        );

        // save in user profile
        await updateDoc(
            doc(db, 'users', userId),
            {
                certificateNumber:
                    nextNumber.toString()
            }
        );

        return nextNumber.toString();
    };

    // =========================
    // GET CERTIFICATE NUMBER
    // =========================

    const certificateNumber =
        await getCertificateNumber();

    // =========================
    // PDF INIT
    // =========================

    const docPDF = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const W = 210;
    const H = 297;
    const ML = 14;

    // =========================
    // LOAD IMAGES
    // =========================

    const loadImage = (src: string) => {
        return new Promise<string>((resolve) => {

            const img = new Image();

            img.crossOrigin = 'Anonymous';

            img.onload = () => {

                const canvas =
                    document.createElement('canvas');

                canvas.width =
                    img.naturalWidth;

                canvas.height =
                    img.naturalHeight;

                const ctx =
                    canvas.getContext('2d');

                if (ctx) {

                    ctx.drawImage(
                        img,
                        0,
                        0
                    );

                    resolve(
                        canvas.toDataURL(
                            'image/png'
                        )
                    );
                }
            };

            img.src = src;
        });
    };

    const headerImg =
        await loadImage('/ii.png');

    const footerImg =
        await loadImage('/ff.png');

    const watermarkImg =
        await loadImage('/dded.jpeg');

    // =========================
    // STUDENT DATA
    // =========================

    const studentName =
        profile?.fullName ||
        '[Student Full Name]';

    const rollNumber =
        profile?.universityRoll ||
        '[Roll Number]';

    const college =
        profile?.college ||
        '[College Name]';

    const department =
        profile?.department ||
        '[Department]';

    const semester =
        profile?.semester ||
        '[Semester]';

    const domain =
        profile?.internshipDomain ||
        '[Domain]';

    const totalHours =
        profile?.totalHoursCompleted ||
        '120';

    // =========================
    // DATE FORMAT
    // =========================

    const formatDate = (
        iso: string | undefined
    ) => {

        if (!iso)
            return '01/01/2026';

        const d = new Date(iso);

        const dd = String(
            d.getDate()
        ).padStart(2, '0');

        const mm = String(
            d.getMonth() + 1
        ).padStart(2, '0');

        const yyyy =
            d.getFullYear();

        return `${dd}/${mm}/${yyyy}`;
    };

    const letterDate =
        formatDate(
            profile?.registrationDate
        );

    // =========================
    // IMAGE DIMENSIONS
    // =========================

    const headerH =
        (252 / 998) * W;

    const footerH =
        (322 / 1002) * W;

    // =========================
    // HEADER
    // =========================

    docPDF.addImage(
        headerImg,
        'PNG',
        0,
        0,
        W,
        headerH
    );

    // =========================
    // WATERMARK
    // =========================

    const wmSize = 90;

    const wmX =
        (W - wmSize) / 2;

    const wmY =
        (H - wmSize) / 2;

    (docPDF as any)
        .saveGraphicsState();

    (docPDF as any)
        .setGState(
            (docPDF as any).GState({
                opacity: 0.10
            })
        );

    docPDF.addImage(
        watermarkImg,
        'JPEG',
        wmX,
        wmY,
        wmSize,
        wmSize
    );

    (docPDF as any)
        .restoreGraphicsState();

    // =========================
    // BODY
    // =========================

    let y = headerH + 5;

    docPDF.setFontSize(8.5);

    // =========================
    // REF NO
    // =========================

    docPDF.setFont(
        'Helvetica',
        'normal'
    );

    docPDF.text(
        'Letter Ref. No.: ',
        ML,
        y
    );

    docPDF.setFont(
        'Helvetica',
        'bold'
    );

    docPDF.text(
        `IM/2026/ICC/${certificateNumber}`,
        ML +
        docPDF.getTextWidth(
            'Letter Ref. No.: '
        ),
        y
    );

    docPDF.setFont(
        'Helvetica',
        'normal'
    );

    docPDF.text(
        `Date: ${letterDate}`,
        W - ML,
        y,
        {
            align: 'right'
        }
    );

    y += 12;

    // =========================
    // TITLE
    // =========================

    docPDF.setFontSize(18);

    docPDF.setFont(
        'Helvetica',
        'bold'
    );

    docPDF.text(
        'INTERNSHIP COMPLETION CERTIFICATE',
        W / 2,
        y,
        {
            align: 'center'
        }
    );

    y += 14;

    // =========================
    // BODY TEXT
    // =========================

    docPDF.setFontSize(11);

    docPDF.setFont(
        'Helvetica',
        'normal'
    );

    const bodyText = `
This is to certify that ${studentName},
bearing University Roll Number ${rollNumber},
from ${college},
Department ${department},
Semester ${semester},
has successfully completed the internship programme in ${domain}
at InternMitra Technologies Private Limited.
`;

    const splitBody =
        docPDF.splitTextToSize(
            bodyText,
            W - 2 * ML
        );

    docPDF.text(
        splitBody,
        ML,
        y
    );

    y +=
        splitBody.length * 6 + 10;

    // =========================
    // DETAILS HEADING
    // =========================

    docPDF.setFont(
        'Helvetica',
        'bold'
    );

    docPDF.text(
        'Internship Details',
        ML,
        y
    );

    y += 10;

    // =========================
    // DETAILS TABLE
    // =========================

    const rows = [
        [
            'Student Name',
            studentName
        ],
        [
            'University Roll Number',
            rollNumber
        ],
        [
            'College / Institution',
            college
        ],
        [
            'Department',
            department
        ],
        [
            'Semester',
            semester
        ],
        [
            'Internship Domain',
            domain
        ],
        [
            'Total Hours Completed',
            `${totalHours} Hours`
        ],
        [
            'Certificate Number',
            `IM/2026/ICC/${certificateNumber}`
        ]
    ];

    rows.forEach(
        ([label, value]) => {

            docPDF.setFont(
                'Helvetica',
                'normal'
            );

            docPDF.text(
                String(label),
                ML + 5,
                y
            );

            docPDF.text(
                ':',
                78,
                y
            );

            docPDF.setFont(
                'Helvetica',
                'bold'
            );

            docPDF.text(
                String(value),
                85,
                y
            );

            y += 8;
        }
    );

    y += 8;

    // =========================
    // PERFORMANCE TEXT
    // =========================

    docPDF.setFont(
        'Helvetica',
        'normal'
    );

    const closingText = `
The student has successfully completed all assigned internship tasks,
training sessions and practical learning modules under the supervision
of InternMitra mentors and coordinators.

We appreciate the dedication, discipline and participation shown during
the internship programme and wish the student success in future endeavors.
`;

    const splitClosing =
        docPDF.splitTextToSize(
            closingText,
            W - 2 * ML
        );

    docPDF.text(
        splitClosing,
        ML,
        y
    );

    y +=
        splitClosing.length * 5 + 10;

    // =========================
    // QR CODE
    // =========================

    const qrData = `
Name: ${studentName}
Roll Number: ${rollNumber}
College: ${college}
Domain: ${domain}
Certificate No: IM/2026/ICC/${certificateNumber}
`;

    const qrImage =
        await QRCode.toDataURL(
            qrData
        );

    docPDF.addImage(
        qrImage,
        'PNG',
        ML,
        H - 80,
        32,
        32
    );

    // =========================
    // SIGNATURE
    // =========================

    docPDF.setFont(
        'Helvetica',
        'bold'
    );

    docPDF.text(
        'Mr. Amarjeet Kumar',
        W - 65,
        H - 40
    );

    docPDF.setFont(
        'Helvetica',
        'normal'
    );

    docPDF.text(
        'Founder & CEO',
        W - 55,
        H - 34
    );

    // =========================
    // FOOTER
    // =========================

    docPDF.addImage(
        footerImg,
        'PNG',
        0,
        H - footerH,
        W,
        footerH
    );

    // =========================
    // SAVE PDF
    // =========================

    docPDF.save(
        `InternMitra_Certificate_${studentName.replace(
            /\s+/g,
            '_'
        )}.pdf`
    );
};