const { getAdminApp, json, requireAdmin } = require('./utils/firebase-admin');

async function getCollegeAmount(db, collegeName) {
  if (!collegeName) return 1000;
  try {
    const snap = await db.collection("colleges").where("name", "==", collegeName).limit(1).get();
    if (snap.empty) return 1000;
    const price = snap.docs[0].data().price;
    return Number.isFinite(Number(price)) && Number(price) > 0 ? Number(price) : 1000;
  } catch (err) {
    console.error("Error getting college amount:", err);
    return 1000;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed' });
  }

  try {
    const authResult = await requireAdmin(event);
    if (!authResult.allowed) {
      return authResult.response;
    }

    const parsedBody = JSON.parse(event.body || '{}');
    const { students } = parsedBody;

    if (!Array.isArray(students) || students.length === 0) {
      return json(400, { error: "Invalid payload: students list is empty or not an array" });
    }

    const firebaseAdmin = getAdminApp();
    const db = firebaseAdmin.firestore();
    const importedRef = db.collection("importedStudents");
    
    let importedCount = 0;
    const CHUNK_SIZE = 400;

    for (let i = 0; i < students.length; i += CHUNK_SIZE) {
      const chunk = students.slice(i, i + CHUNK_SIZE);
      const batch = db.batch();

      for (const student of chunk) {
        if (!student.universityRoll) continue;

        const existingQuery = await importedRef.where("universityRoll", "==", student.universityRoll).limit(1).get();
        
        const docData = {
          fullName: student.fullName || "",
          parentName: student.parentName || "",
          contactNumber: student.contactNumber || "",
          email: student.email || "",
          gender: student.gender || "",
          college: student.college || "",
          university: student.university || "",
          course: student.course || "",
          semester: student.semester || "",
          universityRoll: student.universityRoll || "",
          industrialRegNo: student.industrialRegNo || "",
          academicDetails: student.academicDetails || "",
          importedAt: new Date().toISOString(),
          paymentStatus: "Pending",
          whatsappSent: false,
        };

        if (!existingQuery.empty) {
          const docId = existingQuery.docs[0].id;
          batch.set(importedRef.doc(docId), docData, { merge: true });
        } else {
          const newRef = importedRef.doc();
          batch.set(newRef, docData);
        }
        
        importedCount += 1;
      }

      await batch.commit();
    }

    // Serverless friendly WhatsApp message logging inside request cycle
    console.log(`[WhatsApp Notifications] Starting dispatch for ${students.length} students...`);
    const appUrl = process.env.APP_URL || "https://internmitra.com";

    for (const student of students) {
      if (!student.contactNumber || !student.universityRoll) continue;

      // Check if student is already registered & paid
      const registeredUserSnap = await db.collection("users").where("universityRoll", "==", student.universityRoll).limit(1).get();
      if (!registeredUserSnap.empty) {
        const registeredUserData = registeredUserSnap.docs[0].data();
        if (registeredUserData.paymentStatus === "success" || registeredUserData.isPaid === true) {
          continue;
        }
      }

      const collegeAmount = await getCollegeAmount(db, student.college);
      const securePaymentLink = `${appUrl}/register?roll=${encodeURIComponent(student.universityRoll)}&ind=${encodeURIComponent(student.industrialRegNo)}`;
      const messageText = `Dear ${student.fullName}, your registration for the Internship Program from ${student.college || 'your college'} is pending. Please complete your registration and pay a fee of ₹${collegeAmount} using this secure link: ${securePaymentLink}`;

      // Simulate WhatsApp message (print to log)
      console.log(`\n======================================================`);
      console.log(`[WHATSAPP AUTOMATED DISPATCH]`);
      console.log(`To: +91${student.contactNumber}`);
      console.log(`Message: ${messageText}`);
      console.log(`======================================================\n`);

      // Update student status to whatsappSent: true
      const checkImportedRef = await importedRef.where("universityRoll", "==", student.universityRoll).limit(1).get();
      if (!checkImportedRef.empty) {
        await checkImportedRef.docs[0].ref.update({
          whatsappSent: true,
          whatsappSentAt: new Date().toISOString()
        });
      }

      // If a WhatsApp endpoint/service is configured, call it here:
      if (process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN) {
        try {
          // Dynamic import of node-fetch or using standard global fetch if supported
          // Node 18+ has global fetch
          await fetch(process.env.WHATSAPP_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.WHATSAPP_API_TOKEN}`
            },
            body: JSON.stringify({
              phone: student.contactNumber,
              message: messageText
            })
          });
        } catch (apiErr) {
          console.error(`Failed to send WhatsApp message to ${student.contactNumber} via API:`, apiErr);
        }
      }
    }

    return json(200, { status: "success", importedCount });
  } catch (error) {
    console.error("Excel Import Serverless Error:", error);
    return json(500, {
      error: "Error occurred during Excel student import",
      details: error?.message || "Unknown error"
    });
  }
};
