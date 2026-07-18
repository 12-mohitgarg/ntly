import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import admin from "firebase-admin";
import type { Request, Response, NextFunction } from "express";
import { sendEmail } from "./server/mailer";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Razorpay Initialization
// Safety check for keys
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_live_SoVxB05ogtK0Fl";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "23a2eaU3UwRf4LnZaBWVvpvr";

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

function getFirebaseAdminCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
  }

  const projectId = cleanEnvValue(process.env.FIREBASE_PROJECT_ID) || "intermitra-backup";
  const clientEmail = cleanEnvValue(process.env.FIREBASE_CLIENT_EMAIL);
  const privateKey = getFirebasePrivateKey();

  if (clientEmail && privateKey) {
    return admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    });
  }

  return admin.credential.applicationDefault();
}

function getFirebasePrivateKey() {
  if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
    return Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, "base64").toString("utf8");
  }

  return process.env.FIREBASE_PRIVATE_KEY
    ?.trim()
    .replace(/,$/, "")
    .replace(/^['"]|['"]$/g, "")
    .replace(/,$/, "")
    .replace(/\\\\n/g, "\n")
    .replace(/\\n/g, "\n");
}

function getFirebaseProjectId() {
  return cleanEnvValue(process.env.FIREBASE_PROJECT_ID) || "intermitra-backup";
}

function cleanEnvValue(value?: string) {
  return value
    ?.trim()
    .replace(/,$/, "")
    .replace(/^['"]|['"]$/g, "")
    .replace(/,$/, "")
    .trim();
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: getFirebaseAdminCredential(),
    projectId: getFirebaseProjectId(),
  });
}

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return res.status(401).json({ error: "Missing admin authorization token" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const email = decodedToken.email || "";

    if (email === "admin@internmitra.com") {
      return next();
    }

    const adminDoc = await admin.firestore().collection("admins").doc(decodedToken.uid).get();
    const adminData = adminDoc.exists ? adminDoc.data() : null;
    const isAllowedAdmin =
      adminData?.isActive === true &&
      ["admin", "super_admin"].includes(String(adminData?.role || ""));

    if (!isAllowedAdmin) {
      return res.status(403).json({ error: "Only admins can update user passwords" });
    }

    next();
  } catch (error: any) {
    console.error("Admin authorization error:", error);
    res.status(401).json({
      error: "Unable to verify admin session",
      details: error?.message || "Unknown authorization error",
    });
  }
};

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", environment: process.env.NODE_ENV });
});

app.patch("/api/admin/users/:uid/password", requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const { password } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "User id is required" });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    await admin.auth().updateUser(uid, { password });
    res.json({ status: "success" });
  } catch (error: any) {
    console.error("Password update error:", error);
    res.status(500).json({
      error: "Error updating user password",
      details: error?.message || "Unknown error",
    });
  }
});

app.post("/api/payment/order", async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;
    
    if (!amount) {
      return res.status(400).send("Amount is required");
    }

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency,
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };
    
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ 
      error: "Error creating Razorpay order", 
      details: error.description || error.message || "Unknown error" 
    });
  }
});

app.post("/api/payment/verify", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ status: "failure", message: "Missing required verification parameters" });
    }

    const hmac = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature === razorpay_signature) {
      res.json({ status: "success" });
    } else {
      console.warn("Signature Verification Failed");
      res.status(400).json({ status: "failure", message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ status: "error", message: "Internal server error during verification" });
  }
});

app.post("/api/offer-letter-email", async (req, res) => {
  try {
    const { to, studentName, internshipDomain, fileName, pdfBase64 } = req.body || {};

    if (!to || !pdfBase64) {
      return res.status(400).json({ error: "Student email and PDF attachment are required" });
    }

    console.log(`[Email Request] Queueing offer letter via Gmail SMTP to: ${to}, Name: ${studentName}`);

    sendEmail({
      to,
      subject: "Your InternMitra Internship Acceptance Letter",
      html: `
        <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6">
          <p>Dear ${studentName || "Student"},</p>
          <p>Greetings from InternMitra!</p>
          <p>Congratulations! You have been successfully enrolled in the ${internshipDomain || "Internship"} Internship Program.</p>
          <p>This email serves as your official Internship Acceptance Letter and confirms your participation in the internship program.</p>
          <p>Further details, including internship access, training schedules, assignments, and guidelines, will be shared on your registered email address.</p>
          <p>We wish you a successful and rewarding internship journey.</p>
          <p>Best Regards,<br/>InternMitra Team</p>
        </div>
      `,
      attachments: [
        {
          filename: fileName || "InternMitra_Offer_Letter.pdf",
          content: pdfBase64,
        },
      ],
    })
      .then((result) => {
        console.log(`[Email Request] SMTP send success:`, result.messageId);
      })
      .catch((error) => {
        console.error(`[Email Request] SMTP send failed:`, error);
      });

    res.json({ status: "processing" });
  } catch (error: any) {
    console.error("Offer letter email error:", error);
    res.status(500).json({
      error: "Unable to send offer letter email",
      details: error?.message || "Unknown error",
    });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
