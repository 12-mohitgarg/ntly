import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Razorpay Initialization
// Safety check for keys
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_live_SoVxB05ogtK0Fl";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "23a2eaU3UwRf4LnZaBWVvpvr";

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", environment: process.env.NODE_ENV });
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
