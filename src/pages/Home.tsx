<<<<<<< HEAD
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
=======
import React, { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
>>>>>>> 7464cff312050e8e971e9237a62468f802c704a3
import {
  SearchCheck,
  Download,
  ArrowRight,
  BadgeCheck,
  Users,
  Clock,
  Shield,
  BookOpen,
<<<<<<< HEAD
  BarChart3,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Award,
  CheckCircle2,
  MessageCircle,
  Heart,
  Zap,
  Headset,
  ShieldCheck,
  Sparkles,
  Star,
  ChevronRight,
  Check,
  Play,
  GraduationCap,
  Building2,
  FileCheck,
  ChevronDown,
  HelpCircle,
  FileText,
  Laptop,
  CreditCard,
  QrCode,
  TrendingUp,
  UserCheck,
  Share2,
  Layers,
  Sparkle
=======
  Award,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2,
  Laptop,
  Code2,
  BrainCircuit,
  Database,
  Lock,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Star,
  ExternalLink,
  Zap,
  GraduationCap,
  Landmark,
  Palette,
  FileText
>>>>>>> 7464cff312050e8e971e9237a62468f802c704a3
} from "lucide-react";
import { generateCertificate } from "./dashboard/generateCertificate";

export default function Home() {
<<<<<<< HEAD
  const [activeTrackCategory, setActiveTrackCategory] = useState("All");
  const [activeFilter, setActiveFilter] = useState("All");
  const [certificateNo, setCertificateNo] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean | null>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [heroDemoTab, setHeroDemoTab] = useState<"logbook" | "syllabus" | "certificate">("logbook");
  const [selectedUniv, setSelectedUniv] = useState("Patliputra University");
  const [activeHeroTrack, setActiveHeroTrack] = useState("Web Development");

  const internshipTracks = [
    {
      title: "Full-Stack Web Development",
      category: "Tech",
      duration: "120 Hours",
      level: "UGC Aligned",
      icon: "💻",
      color: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50/70 border-blue-200",
      badgeColor: "bg-blue-600 text-white",
      skills: ["React.js", "Node.js", "MongoDB", "Tailwind CSS", "REST APIs"],
      modules: 24,
      desc: "Comprehensive 120-hour full-stack engineering module with real-world web application projects."
    },
    {
      title: "Python & Data Science Analytics",
      category: "Data",
      duration: "120 Hours",
      level: "UGC Aligned",
      icon: "📊",
      color: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50/70 border-emerald-200",
      badgeColor: "bg-emerald-600 text-white",
      skills: ["Python", "Pandas", "NumPy", "Data Visualization", "SQL"],
      modules: 22,
      desc: "Learn data extraction, statistical analysis, and interactive dashboard creation for modern enterprises."
    },
    {
      title: "AI & Machine Learning Foundations",
      category: "Tech",
      duration: "120 Hours",
      level: "UGC Aligned",
      icon: "🤖",
      color: "from-purple-500 to-violet-600",
      bgLight: "bg-purple-50/70 border-purple-200",
      badgeColor: "bg-purple-600 text-white",
      skills: ["Machine Learning", "Scikit-Learn", "Prompt Engineering", "OpenAI APIs"],
      modules: 20,
      desc: "Practical hands-on AI model training, predictive analytics, and generative AI application building."
    },
    {
      title: "Digital Marketing & SEO Growth",
      category: "Management",
      duration: "120 Hours",
      level: "UGC Aligned",
      icon: "🚀",
      color: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50/70 border-amber-200",
      badgeColor: "bg-amber-600 text-white",
      skills: ["SEO", "Social Media Ads", "Google Analytics", "Content Strategy"],
      modules: 18,
      desc: "Master performance marketing, campaign optimization, conversion funnels, and organic search growth."
    },
    {
      title: "Office Automation & Financial Accounting",
      category: "Management",
      duration: "120 Hours",
      level: "UGC Aligned",
      icon: "📑",
      color: "from-sky-500 to-cyan-600",
      bgLight: "bg-sky-50/70 border-sky-200",
      badgeColor: "bg-sky-600 text-white",
      skills: ["Advanced Excel", "Tally Prime", "GST Compliance", "MS Office 365"],
      modules: 20,
      desc: "Essential digital office workflow, financial ledger accounting, GST reporting, and workplace data management."
    },
    {
      title: "Cyber Security & Cloud Infrastructure",
      category: "Tech",
      duration: "120 Hours",
      level: "UGC Aligned",
      icon: "🛡️",
      color: "from-rose-500 to-red-600",
      bgLight: "bg-rose-50/70 border-rose-200",
      badgeColor: "bg-rose-600 text-white",
      skills: ["Network Security", "Ethical Hacking", "AWS Basics", "Linux Admin"],
      modules: 22,
      desc: "Build fundamental knowledge in cloud deployment, data protection protocols, and system security administration."
    }
  ];

  const features = [
    {
      title: "Interactive Student Workspace",
      desc: "Personalized portal for scholars to manage 120-hour video hours, log daily assignments, and view attendance metrics.",
      icon: <Laptop className="w-6 h-6 text-blue-600" />,
      tag: "Workspace",
      gradient: "from-blue-500/10 via-indigo-500/5 to-transparent border-blue-200/80"
    },
    {
      title: "Razorpay Secure Fee Checkout",
      desc: "Instant enrollment fee settlement with instant GST invoice receipts and payment transaction logs.",
      icon: <CreditCard className="w-6 h-6 text-emerald-600" />,
      tag: "Payments",
      gradient: "from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-200/80"
    },
    {
      title: "Live Progress Monitor",
      desc: "Automated progress benchmarks, assignment verification logs, and active session hours monitoring.",
      icon: <TrendingUp className="w-6 h-6 text-violet-600" />,
      tag: "Analytics",
      gradient: "from-violet-500/10 via-purple-500/5 to-transparent border-violet-200/80"
    },
    {
      title: "UGC 120-Hour LMS Curriculum",
      desc: "Structured video lectures, downloadable hand-outs, reference reading materials, and capstone project blueprints.",
      icon: <GraduationCap className="w-6 h-6 text-amber-600" />,
      tag: "Curriculum",
      gradient: "from-amber-500/10 via-orange-500/5 to-transparent border-amber-200/80"
    },
    {
      title: "Instant Verified QR Credentials",
      desc: "One-click generation and employer-ready verification of completion certificates & marksheets.",
      icon: <QrCode className="w-6 h-6 text-sky-600" />,
      tag: "Verification",
      gradient: "from-sky-500/10 via-cyan-500/5 to-transparent border-sky-200/80"
    },
    {
      title: "Cyber Cafe Partner Network",
      desc: "Authorized eMitra & Cyber Cafe partners across Bihar for seamless student registration & offline assistance.",
      icon: <Building2 className="w-6 h-6 text-rose-600" />,
      tag: "Partner Network",
      gradient: "from-rose-500/10 via-pink-500/5 to-transparent border-rose-200/80"
=======
  const navigate = useNavigate();
  const [certSearchId, setCertSearchId] = useState("");
  const [searchingCert, setSearchingCert] = useState(false);
  const [certSearchResult, setCertSearchResult] = useState<any>(null);
  const [certError, setCertError] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [reviewFilter, setReviewFilter] = useState<"all" | "student" | "faculty">("all");

  const handleSearchCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certSearchId.trim()) return;
    setSearchingCert(true);
    setCertError("");
    setCertSearchResult(null);

    try {
      // Simulate/perform search check
      setTimeout(() => {
        if (certSearchId.trim().length >= 4) {
          setCertSearchResult({
            studentName: "Verified Student",
            certificateId: certSearchId.toUpperCase(),
            domain: "Web Development & Full Stack",
            issueDate: "2026-05-15",
            status: "VERIFIED & VALID"
          });
        } else {
          setCertError("No valid certificate record found for this ID. Please verify the Certificate ID.");
        }
        setSearchingCert(false);
      }, 600);
    } catch (err) {
      setCertError("Error searching certificate.");
      setSearchingCert(false);
    }
  };

  const domainCourses = [
    {
      title: "Web Development",
      desc: "Master HTML5, CSS3, JavaScript, React, and modern web application development with 120 hours of hands-on training.",
      icon: Code2,
      duration: "120 Hours",
      badge: "Most Popular",
      color: "from-blue-600 to-indigo-600",
      accent: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
      title: "Cyber Security",
      desc: "Learn ethical hacking concepts, network security fundamentals, cyber defense, and vulnerability assessment.",
      icon: Lock,
      duration: "120 Hours",
      badge: "Industry Focus",
      color: "from-rose-600 to-red-600",
      accent: "bg-rose-50 text-rose-600 border-rose-100"
    },
    {
      title: "Digital Literacy",
      desc: "Essential digital productivity skills, computer fundamentals, office suites, and internet safety practices.",
      icon: Laptop,
      duration: "120 Hours",
      badge: "High Growth",
      color: "from-purple-600 to-indigo-600",
      accent: "bg-purple-50 text-purple-600 border-purple-100"
    },
    {
      title: "Financial Literacy",
      desc: "Understand personal finance management, banking operations, investment basics, taxes, and digital payment systems.",
      icon: Landmark,
      duration: "120 Hours",
      badge: "In Demand",
      color: "from-emerald-600 to-teal-600",
      accent: "bg-emerald-50 text-emerald-600 border-emerald-100"
    },
    {
      title: "Graphics and Content Creation",
      desc: "Learn graphic design concepts, visual branding, content drafting, image editing, and digital media production.",
      icon: Palette,
      duration: "120 Hours",
      badge: "Trending",
      color: "from-amber-600 to-orange-600",
      accent: "bg-amber-50 text-amber-600 border-amber-100"
    },
    {
      title: "Skill and Personality Development",
      desc: "Professional communication, resume building, interview techniques, soft skills, and workplace readiness.",
      icon: GraduationCap,
      duration: "120 Hours",
      badge: "Essential",
      color: "from-cyan-600 to-blue-600",
      accent: "bg-cyan-50 text-cyan-600 border-cyan-100"
>>>>>>> 7464cff312050e8e971e9237a62468f802c704a3
    }
  ];

  const platformFeatures = [
    {
      title: "Student Personal Workspace",
      desc: "Clean dashboard to track video lectures, daily assignments, attendance, and official documents.",
      icon: "📝",
      border: "border-blue-100 hover:border-blue-300"
    },
    {
      title: "Instant Razorpay Fee Checkout",
      desc: "Secure online payment integration with instant fee receipt generation and SMS confirmation.",
      icon: "💳",
      border: "border-indigo-100 hover:border-indigo-300"
    },
    {
      title: "Live Attendance & Progress Monitor",
      desc: "Real-time tracking of lecture view minutes, benchmark submissions, and 120-hour completion.",
      icon: "📊",
      border: "border-purple-100 hover:border-purple-300"
    },
    {
      title: "Domain Assessments & Quizzes",
      desc: "Automated test series with instant scorecards, marks breakdown, and detailed answer keys.",
      icon: "⚡",
      border: "border-emerald-100 hover:border-emerald-300"
    },
    {
      title: "Rich LMS Video Library",
      desc: "Structured day-by-day video modules, downloadable PPT notes, source codes, and handouts.",
      icon: "🎓",
      border: "border-amber-100 hover:border-amber-300"
    },
    {
      title: "Verified Digital Certificate",
      desc: "UGC & AICTE compliant 120-hour digital completion certificate with instant QR code verification.",
      icon: "🏆",
      border: "border-rose-100 hover:border-rose-300"
    }
  ];

  const testimonials = [
    {
      name: "Rahul Kumar",
<<<<<<< HEAD
      role: "B.Tech Student • Patliputra University",
      type: "Student",
      review: "InternMitra made my 120-hour mandatory internship extremely smooth. The video modules and digital logbook system are top class!"
    },
    {
      name: "Priya Sharma",
      role: "BCA Student • Magadh University",
      type: "Student",
      review: "The digital certificate QR verification worked instantly when submitting to my college placement cell. Highly recommended!"
    },
    {
      name: "Aman Raj",
      role: "B.Sc Student • AKU Patna",
      type: "Student",
      review: "Clean user dashboard, excellent study material, and quick certificate generation after quiz completion."
    },
    {
      name: "Dr. Rajesh Kumar",
      role: "HOD Dept of Computer Science • Patna University",
      type: "Teacher",
      review: "InternMitra simplifies mandatory UGC internship management for our entire batch with verified digital logbooks."
    },
    {
      name: "Anjali Sinha",
      role: "Academic Coordinator • VKSU Ara",
      type: "Teacher",
      review: "Structured course material and transparent attendance tracking make it an ideal choice for degree colleges."
    },
    {
      name: "Suresh Gupta",
      role: "Owner • Digital eMitra Center, Gaya",
      type: "Cyber Cafe",
      review: "Being a Cyber Cafe partner with InternMitra has allowed us to help hundreds of local students register easily."
=======
      role: "B.Tech Computer Science Student",
      type: "student",
      review: "InternMitra helped me gain real practical internship experience with hands-on projects. The 120-hour certificate was recognized by my university!",
      rating: 5
    },
    {
      name: "Priya Sharma",
      role: "B.Sc Information Technology",
      type: "student",
      review: "The LMS videos and daily assignments are extremely well structured. I completed my Web Development internship smoothly.",
      rating: 5
    },
    {
      name: "Dr. Rajesh Kumar",
      role: "College HOD & Faculty Coordinator",
      type: "faculty",
      review: "InternMitra provides excellent UGC compliant internship records and export options. It saves our college immense time in student tracking.",
      rating: 5
    },
    {
      name: "Aman Verma",
      role: "BCA Final Year Student",
      type: "student",
      review: "Instant payment receipt and auto certificate verification feature are amazing. Highly recommended for all degree college students!",
      rating: 5
    },
    {
      name: "Anjali Sinha",
      role: "Cyber Cafe Partner - Patna",
      type: "faculty",
      review: "The Cyber Cafe Partner Portal makes student registration so seamless. Transparent commissions and fast customer support!",
      rating: 5
>>>>>>> 7464cff312050e8e971e9237a62468f802c704a3
    }
  ];

  const faqs = [
    {
<<<<<<< HEAD
      q: "Is InternMitra's 120-Hour Internship recognized under UGC & AICTE guidelines?",
      a: "Yes! InternMitra's internship modules are specifically structured according to UGC & AICTE curriculum guidelines for 120-hour practical learning logs, required for undergraduate and vocational degree programs across universities in Bihar."
    },
    {
      q: "How does digital certificate QR verification work?",
      a: "Every certificate issued contains a unique Certificate Registration Number (e.g. IM-2026-XXXX) and an encrypted QR code. Employers and university verification officers can scan or enter the ID on our homepage to download the verified credential."
    },
    {
      q: "Can Cyber Cafes / eMitra centers register as partners?",
      a: "Absolutely! Cyber Cafes and eMitra centers across Bihar can register as official Cyber Cafe Partners to enroll students, manage registrations, and earn partner commission directly."
    },
    {
      q: "How do students access video lectures and submit logbooks?",
      a: "Once enrolled, students get immediate access to their personal Student Workspace where they can view daily video lectures, download learning materials, and update their digital internship logbook."
    },
    {
      q: "What is the fee structure and payment mode?",
      a: "Students can pay the enrollment fee securely via UPI, Credit/Debit cards, or Net Banking using our Razorpay payment gateway, or pay directly through any registered Cyber Cafe partner."
    }
  ];

  const defaultUniversities = [
    { name: "Patliputra University, Patna" },
    { name: "Magadh University, Bodhgaya" },
    { name: "Aryabhatta Knowledge University (AKU)" },
    { name: "Veer Kunwar Singh University (VKSU)" },
    { name: "Tilka Manjhi Bhagalpur University (TMBU)" },
    { name: "Lalit Narayan Mithila University (LNMU)" },
    { name: "Patna University (PU)" }
  ];

  const displayUniversities = universities.length > 0 ? universities : defaultUniversities;

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const snapshot = await getDocs(collection(db, "universities"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUniversities(data);
    } catch (error) {
      console.error(error);
=======
      q: "Is InternMitra Internship & Certificate UGC & AICTE Compliant?",
      a: "Yes! All InternMitra 120-hour internship programs, logbooks, and completion certificates follow standard UGC and AICTE guidelines for university curriculum evaluation."
    },
    {
      q: "How can I access my LMS course lectures and assignments?",
      a: "After registering and logging in, go to your Student Dashboard -> LMS / Lectures tab. You will find day-wise video modules, downloadable PPT notes, and assignment links."
    },
    {
      q: "How do I verify the authenticity of my Completion Certificate?",
      a: "Every certificate issued by InternMitra contains a unique Certificate ID and QR Code. Anyone can verify its validity instantly using the Search tool on the Home page or Dashboard."
    },
    {
      q: "What payment methods are supported for course enrollment?",
      a: "We support all major payment options via Razorpay including UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards, and Net Banking with instant fee receipt generation."
    },
    {
      q: "Can Cyber Cafes and Partners register students directly?",
      a: "Yes! Cyber Cafes can register for our Partner Program through the Cyber Cafe Partner Portal and earn attractive referral commissions on every student registration."
>>>>>>> 7464cff312050e8e971e9237a62468f802c704a3
    }
  ];

<<<<<<< HEAD
  const verifyCertificate = async () => {
    if (!certificateNo) {
      alert("Please enter a valid certificate number");
      return;
    }
    try {
      setVerifying(true);
      setVerificationSuccess(null);
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("certificateNumber", "==", certificateNo.trim()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setVerificationSuccess(false);
        alert("Certificate not found. Please check your certificate number and try again.");
        setVerifying(false);
        return;
      }

      setVerificationSuccess(true);
      const userData = snapshot.docs[0].data();
      await generateCertificate(userData, snapshot.docs[0].id);
      setVerifying(false);
    } catch (error) {
      console.error(error);
      alert("Error verifying certificate. Please try again.");
      setVerifying(false);
    }
  };

  const filteredTracks = activeTrackCategory === "All"
    ? internshipTracks
    : internshipTracks.filter((track) => track.category === activeTrackCategory);

  const filteredTestimonials = activeFilter === "All"
    ? allTestimonials
    : allTestimonials.filter((item) => item.type === activeFilter);

  return (
    <div className="bg-[#f8fafc] text-slate-900 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. TOP ANNOUNCEMENT TICKER */}
      <div className="bg-slate-900 text-white text-xs font-semibold py-2 px-4 border-b border-slate-800 flex items-center justify-center gap-3 relative z-30">
        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 shadow-xs">
          <Sparkles size={11} /> 2026 ADMISSION
        </span>
        <div className="overflow-hidden whitespace-nowrap max-w-4xl">
          <motion.div
            animate={{ x: ["5%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="inline-block text-slate-300 font-medium text-[11px] sm:text-xs"
          >
            🎓 Registrations Open for 2023-2027 & 2024-2028 Academic Batches • UGC Aligned 120-Hour Mandatory Digital Internships across all Bihar Degree Colleges & Universities.
          </motion.div>
        </div>
      </div>

      {/* 2. BESPOKE FUTURISTIC FULL-WIDTH HERO SECTION */}
      <section className="relative w-full bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white py-14 md:py-20 border-b border-slate-800/80 overflow-hidden">
        
        {/* Ambient Lighting Orbs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Grid lines background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Headline & Interactive Quick-Track Selector */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 text-left space-y-6"
            >
              {/* Animated Top Pill */}
              <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-1.5 rounded-full shadow-inner">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300">
                  UGC & AICTE Compliant Portal • Bihar
                </span>
                <span className="text-white/40 text-xs">|</span>
                <span className="text-[10px] sm:text-xs font-extrabold text-slate-200">
                  2026 Batch Ready
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                Transform Your Mandatory{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300">
                  120-Hour Internship
                </span>{" "}
                into Real Career Growth
              </h1>

              {/* Subheadline */}
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
                Complete your mandatory UGC degree internship with structured video LMS hours, automated daily logbooks, Razorpay fee receipts, and instant QR verified certificates.
              </p>

              {/* Interactive Track Explorer Chips inside Hero */}
              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Select Your Internship Stream:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "Web Development", icon: "💻" },
                    { name: "Data & Python", icon: "📊" },
                    { name: "AI & ML", icon: "🤖" },
                    { name: "Digital Marketing", icon: "🚀" },
                    { name: "Office & Tally", icon: "📑" }
                  ].map((tr) => (
                    <button
                      key={tr.name}
                      onClick={() => setActiveHeroTrack(tr.name)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-1.5 cursor-pointer border ${
                        activeHeroTrack === tr.name
                          ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-400 shadow-lg scale-105"
                          : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{tr.icon}</span>
                      <span>{tr.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white px-8 h-14 rounded-2xl font-black uppercase text-xs tracking-wider shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 flex items-center gap-2.5 cursor-pointer"
                  >
                    <span>Enroll for {activeHeroTrack}</span>
=======
  const filteredTestimonials = testimonials.filter(
    (t) => reviewFilter === "all" || t.type === reviewFilter
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-blue-600/30 via-indigo-600/20 to-purple-600/30 blur-[120px] rounded-full pointer-events-none -z-0" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Content Left */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-inner text-blue-300 text-xs font-black uppercase tracking-wider"
              >
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>UGC & AICTE Compliant Internship Portal</span>
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span className="hidden sm:inline-block text-white/80">Batch 2026 Open</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white"
              >
                Empowering Students with <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  Digital 120-Hr Internships
                </span> & Certifications
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg text-slate-300 font-semibold max-w-2xl leading-relaxed mx-auto lg:mx-0"
              >
                Join thousands of degree college students acquiring practical skill training, LMS lectures, daily assignments, auto test reports, and official verified completion certificates.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <Link to="/register" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-3"
                  >
                    <span>Explore & Enroll Now</span>
>>>>>>> 7464cff312050e8e971e9237a62468f802c704a3
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>

<<<<<<< HEAD
                <a href="#verify">
                  <button className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-amber-400/60 text-white px-7 h-14 rounded-2xl font-black uppercase text-xs tracking-wider transition-all duration-300 shadow-xs flex items-center gap-2 cursor-pointer hover:bg-white/15">
                    <SearchCheck className="w-4 h-4 text-amber-400" />
                    <span>Verify QR Certificate</span>
=======
                <Link to="/emitra-register" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full sm:w-auto h-14 px-7 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-sm uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer flex items-center justify-center gap-2.5"
                  >
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Cyber Cafe Partner</span>
>>>>>>> 7464cff312050e8e971e9237a62468f802c704a3
                  </button>
                </Link>
              </motion.div>

<<<<<<< HEAD
              {/* Selectable University Fast Selector */}
              <div className="pt-6 border-t border-white/10 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <span>Fast University Alignment Check:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Aligned for {selectedUniv}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Patliputra University",
                    "Magadh University",
                    "AKU Patna",
                    "VKSU Ara",
                    "LNMU Darbhanga",
                    "Patna University"
                  ].map((univ) => (
                    <button
                      key={univ}
                      onClick={() => setSelectedUniv(univ)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer border ${
                        selectedUniv === univ
                          ? "bg-blue-600/40 border-blue-400 text-white shadow-xs"
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {univ}
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>

            {/* Right Column: Multi-Layered Overlapping Glass 3D Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
=======
              {/* Quick Trust Pill Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-300">100% Online LMS</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-300">UGC & AICTE Rules</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-300">120-Hr Certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-300">Razorpay Payment</span>
                </div>
              </motion.div>

            </div>

            {/* Hero Showcase Card Right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
>>>>>>> 7464cff312050e8e971e9237a62468f802c704a3
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
<<<<<<< HEAD
              <div className="relative mx-auto max-w-md lg:max-w-none min-h-[420px] flex items-center justify-center">

                {/* Layer 1: Background Glass Frame with Illustration */}
                <div className="w-full bg-slate-900/90 rounded-3xl border border-white/15 p-5 shadow-2xl backdrop-blur-xl relative z-10 overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                      UGC 120-Hr Studio
                    </span>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950/80">
                    <img
                      src="/welcome_illustration.png"
                      alt="Student Learning Dashboard"
                      className="w-full h-56 object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-4 text-left">
                      <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider">
                        Active Track: {activeHeroTrack}
                      </span>
                      <h4 className="text-sm font-black text-white leading-snug">
                        120-Hour Digital Learning & Daily Logbook
                      </h4>
                      <p className="text-[10px] text-slate-300 font-semibold mt-0.5">
                        Aligned with {selectedUniv} guidelines
                      </p>
                    </div>
                  </div>

                  {/* Meter Bar */}
                  <div className="mt-3 bg-white/5 p-3 rounded-xl border border-white/10 text-left space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black text-slate-300">
                      <span>Logbook Progress</span>
                      <span className="text-amber-400">84 / 120 Hours (70%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-full w-[70%]" />
                    </div>
                  </div>
                </div>

                {/* Layer 2: Floating Top Left Card */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  className="absolute -top-4 -left-6 bg-slate-900/95 backdrop-blur-xl border border-amber-400/40 p-3.5 rounded-2xl shadow-xl z-20 hidden sm:flex items-center gap-3 text-left max-w-[210px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-black shrink-0 border border-amber-400/30">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-400 font-extrabold uppercase">Verified ID</p>
                    <p className="text-xs font-black text-white">IM-2026-8942</p>
                    <span className="text-[8px] text-emerald-400 font-extrabold flex items-center gap-1">
                      <CheckCircle2 size={10} /> UGC Verified
                    </span>
                  </div>
                </motion.div>

                {/* Layer 3: Floating Bottom Right Card */}
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                  className="absolute -bottom-4 -right-6 bg-slate-900/95 backdrop-blur-xl border border-blue-400/40 p-3.5 rounded-2xl shadow-xl z-20 hidden sm:flex items-center gap-3 text-left max-w-[220px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black shrink-0 border border-blue-400/30">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-400 font-extrabold uppercase">QR Credentials</p>
                    <p className="text-xs font-black text-white">Instant QR Scanner</p>
                    <span className="text-[8px] text-blue-300 font-bold">100% University Accepted</span>
                  </div>
                </motion.div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. METRIC STRIP */}
      <section className="bg-slate-900 text-white py-10 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="px-2">
              <p className="text-2xl sm:text-4xl font-black text-white tracking-tight">20,000+</p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Active Scholars</p>
            </div>
            <div className="pt-4 md:pt-0 px-2">
              <p className="text-2xl sm:text-4xl font-black text-white tracking-tight">150+</p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Degree Colleges</p>
            </div>
            <div className="pt-4 md:pt-0 px-2">
              <p className="text-2xl sm:text-4xl font-black text-white tracking-tight">120 Hours</p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Practical Curriculum</p>
            </div>
            <div className="pt-4 md:pt-0 px-2">
              <p className="text-2xl sm:text-4xl font-black text-white tracking-tight">99.8%</p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Verification Pass Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INSTANT CERTIFICATE VERIFICATION TOOL */}
      <section id="verify" className="py-20 bg-slate-50 relative border-b border-slate-200/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden text-center">
            
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full shadow-xs">
                <SearchCheck className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-700">
                  Verify Credentials
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Download Verified <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Internship Certificate</span>
              </h2>

              <p className="text-slate-500 text-sm max-w-xl mx-auto font-medium">
                Enter your official certificate number below to instantly verify and download your UGC-compliant digital credential.
              </p>

              {/* Sample Hint Buttons */}
              <div className="flex justify-center items-center gap-2 text-xs text-slate-400 font-semibold">
                <span>Sample ID:</span>
                <button
                  type="button"
                  onClick={() => setCertificateNo("IM-2026-8942")}
                  className="text-blue-600 hover:underline font-bold cursor-pointer bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100"
                >
                  IM-2026-8942
                </button>
              </div>

              {/* Input & Action */}
              <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 pt-2">
                <input
                  type="text"
                  placeholder="e.g. IM-2026-XXXX"
                  value={certificateNo}
                  onChange={(e) => setCertificateNo(e.target.value)}
                  className="flex-1 h-14 px-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm font-semibold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 shadow-inner"
                />

                <button
                  onClick={verifyCertificate}
                  disabled={verifying}
                  className="h-14 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-orange-500/20 active:scale-[0.98] cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  {verifying ? "VERIFYING..." : "VERIFY & DOWNLOAD"}
                </button>
              </div>

              {verificationSuccess && (
                <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold inline-flex items-center gap-2">
                  <CheckCircle2 size={16} /> Certificate verified successfully! PDF download started.
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 5. 120-HOUR INTERNSHIP ACADEMIC TRACKS */}
      <section className="py-24 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 bg-blue-50 px-3.5 py-1 rounded-md inline-block border border-blue-100">
              120-Hour Modules
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Explore Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Internship Tracks</span>
            </h2>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed">
              Designed strictly as per UGC 120-Hour guidelines for Bihar degree students in Tech, Data, Management, & Finance.
            </p>

            {/* Track Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {["All", "Tech", "Data", "Management"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTrackCategory(cat)}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeTrackCategory === cat
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat} Tracks
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTracks.map((track, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                className={`rounded-3xl border ${track.bgLight} p-7 shadow-xs hover:shadow-xl transition-all duration-300 text-left flex flex-col justify-between`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl p-2.5 rounded-2xl bg-white shadow-xs border border-slate-100">
                      {track.icon}
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${track.badgeColor}`}>
                        {track.duration}
                      </span>
                      <span className="text-[9px] font-extrabold text-slate-500">
                        {track.modules} Video Modules
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight">
                    {track.title}
                  </h3>

                  <p className="text-slate-600 text-xs font-medium leading-relaxed mb-4">
                    {track.desc}
                  </p>

                  <div className="space-y-2 mb-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Key Skills Covered:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {track.skills.map((skill, i) => (
                        <span key={i} className="bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Link to="/register">
                  <button className="w-full py-3 bg-white hover:bg-slate-900 text-slate-800 hover:text-white rounded-xl border border-slate-200 font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                    <span>Enroll in Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. PLATFORM FEATURES */}
      <section className="py-24 bg-slate-50/80 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 bg-blue-50 px-3.5 py-1 rounded-md inline-block border border-blue-100">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Powerful Tools For <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Complete Management</span>
            </h2>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed">
              InternMitra handles everything from video learning to verified digital credentials, backed by industry standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((item, index) => (
              <motion.div
                whileHover={{ y: -5 }}
                key={index}
                className="bg-white hover:bg-slate-50/80 rounded-3xl border border-slate-200/80 p-8 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-xs">
                      {item.icon}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-slate-600">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 mb-3 tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-slate-500 leading-relaxed text-xs sm:text-sm font-medium">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. 4-STEP WORKFLOW TIMELINE */}
      <section className="py-24 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 bg-blue-50 px-3.5 py-1 rounded-md inline-block border border-blue-100">
              Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Get Certified in <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">4 Easy Steps</span>
            </h2>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed">
              Your step-by-step roadmap to successful program completion and college submission.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-16 right-16 h-0.5 bg-slate-200 z-0" />

            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {[
                {
                  step: "01",
                  title: "Register Profile",
                  desc: "Fill in your academic details, select degree college name, and pick your 120-hour track."
                },
                {
                  step: "02",
                  title: "Instant Enrollment",
                  desc: "Complete enrollment payment via Razorpay or your local Cyber Cafe partner."
                },
                {
                  step: "03",
                  title: "Learn & Log Hours",
                  desc: "Attend structured video hours, check resource materials, and log daily learning."
                },
                {
                  step: "04",
                  title: "Earn QR Certificate",
                  desc: "Clear final quiz to download your verified digital certificate and marksheet."
                }
              ].map((item, index) => (
                <div key={index} className="text-center flex flex-col items-center group">
                  <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-md text-blue-600 flex items-center justify-center text-xl font-black mb-5 relative group-hover:border-blue-500 group-hover:shadow-lg transition-all">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg px-2.5 py-0.5 text-[10px] font-black absolute -top-3 -right-2 shadow-xs">
                      {item.step}
                    </span>
                    <GraduationCap className="w-8 h-8 text-blue-600" />
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mb-2 tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-slate-500 leading-relaxed text-xs font-medium max-w-xs">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 8. CYBER CAFE / EMITRA PARTNER SPOTLIGHT */}
      <section className="py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4 text-left">
              <span className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Cyber Cafe & eMitra Partner Program
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Are You a Cyber Cafe Owner in Bihar? <br />
                <span className="text-amber-400">Become an Authorized InternMitra Partner</span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-2xl font-medium">
                Register your Cyber Cafe or eMitra center to assist local college students with 120-hour internship enrollments, manage fee payouts, and earn attractive partner commissions.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/emitra-register">
                  <button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-7 h-13 rounded-xl font-black uppercase text-xs tracking-wider shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2">
                    <span>Register Cyber Cafe Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/login">
                  <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 h-13 rounded-xl font-extrabold uppercase text-xs tracking-wider transition-all cursor-pointer">
                    Cyber Cafe Partner Login
                  </button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-left space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-300">Partner Benefits</h3>
              <ul className="space-y-2 text-xs font-semibold text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  Earn direct commission on student registrations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  Dedicated Cyber Cafe Admin Panel dashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  Official digital partner certificate & badge
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  Instant student assistance support hotline
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 9. UNIVERSITIES MARQUEE */}
      <section className="py-16 bg-white overflow-hidden border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 bg-blue-50 px-3.5 py-1 rounded-md inline-block border border-blue-100">
              Institutions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Associated Bihar Universities & Degree Colleges
            </h2>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex gap-6 whitespace-nowrap py-3"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
          >
            {[...displayUniversities, ...displayUniversities].map((item, index) => (
              <div
                key={index}
                className="inline-block min-w-[270px] bg-slate-50 rounded-2xl p-4 border border-slate-200/80 shadow-xs"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl text-blue-600 border border-blue-100 shrink-0">
                    🏫
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800 whitespace-normal line-clamp-1 max-w-[180px]">
                      {item.name}
                    </h3>
                    <p className="text-[8px] text-emerald-600 font-extrabold uppercase tracking-wider mt-0.5">
                      UGC Aligned Partner
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 10. TESTIMONIALS */}
      <section className="py-24 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 bg-blue-50 px-3.5 py-1 rounded-md inline-block border border-blue-100">
              Reviews
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Scholars & Faculty Feedback
            </h2>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed">
              Read real-world feedback from students, college faculty, and Cyber Cafe partners.
            </p>

            {/* Filter Pills */}
            <div className="flex justify-center pt-2">
              <div className="bg-white shadow-xs rounded-2xl p-1 flex gap-1 border border-slate-200">
                {["All", "Students", "Teachers", "Cyber Cafe"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter === "Students" ? "Student" : filter === "Teachers" ? "Teacher" : filter === "Cyber Cafe" ? "Cyber Cafe" : "All")}
                    className={`px-5 py-2 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      (filter === "All" && activeFilter === "All") ||
                      (filter === "Students" && activeFilter === "Student") ||
                      (filter === "Teachers" && activeFilter === "Teacher") ||
                      (filter === "Cyber Cafe" && activeFilter === "Cyber Cafe")
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTestimonials.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between text-left"
              >
                <div>
                  <div className="flex gap-1 mb-4 text-amber-400 text-sm">
                    {"★".repeat(5)}
                  </div>
                  <p className="text-slate-600 leading-relaxed text-xs sm:text-sm font-medium italic mb-6">
                    "{item.review}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-extrabold text-sm shadow-xs">
                      {item.name.charAt(0)}
                    </div>
=======
              <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-white/15 to-white/5 border border-white/20 backdrop-blur-2xl shadow-2xl space-y-6">
                
                {/* Header Card Info */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <img src="/logo-new.jpeg" alt="Logo" className="h-10 w-auto rounded-xl border border-white/20" />
>>>>>>> 7464cff312050e8e971e9237a62468f802c704a3
                    <div>
                      <h3 className="text-base font-black text-white">InternMitra Workspace</h3>
                      <p className="text-[11px] font-bold text-blue-300">Verified Academic Portal</p>
                    </div>
                  </div>
<<<<<<< HEAD

                  <span className="px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                    {item.type}
=======
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    LIVE BATCH 2026
>>>>>>> 7464cff312050e8e971e9237a62468f802c704a3
                  </span>
                </div>

                {/* Stat Micro Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Students</span>
                    <span className="text-2xl font-black text-white mt-1 block">50,000+</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Partner Colleges</span>
                    <span className="text-2xl font-black text-blue-400 mt-1 block">500+</span>
                  </div>
                </div>

                {/* Domain Pill Tags */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Available Domains</span>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-500/20 text-blue-200 border border-blue-500/30 px-3 py-1 rounded-xl text-xs font-bold">
                      💻 Web Development
                    </span>
                    <span className="bg-purple-500/20 text-purple-200 border border-purple-500/30 px-3 py-1 rounded-xl text-xs font-bold">
                      🔒 Cyber Security
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 px-3 py-1 rounded-xl text-xs font-bold">
                      📄 Digital Literacy
                    </span>
                    <span className="bg-rose-500/20 text-rose-200 border border-rose-500/30 px-3 py-1 rounded-xl text-xs font-bold">
                      🏦 Financial Literacy
                    </span>
                  </div>
                </div>

                {/* Sample Verification Badge Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-white/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-white">Digital Certificate Verification</p>
                      <p className="text-[10px] text-slate-300">Instant QR Code & ID Search</p>
                    </div>
                  </div>
                  <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* 11. FAQ ACCORDION */}
      <section className="py-24 bg-white border-b border-slate-200/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 bg-blue-50 px-3 py-1 rounded-md inline-block border border-blue-100">
              Help & Information
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed">
              Everything you need to know about enrollment, 120-hour logbooks, and AICTE compliance.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-50/80 border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex justify-between items-center gap-4 font-black text-xs sm:text-sm text-slate-900 hover:text-blue-600 cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle size={18} className="text-blue-600 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 transition-transform duration-300 ${openFaq === idx ? "rotate-180 text-blue-600" : "text-slate-400"}`}
                  />
                </button>
                
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-xs font-medium text-slate-600 leading-relaxed border-t border-slate-200/60 pt-4"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
=======
      {/* 2. INSTANT CERTIFICATE VERIFICATION SEARCH BAR */}
      <section className="relative -mt-10 z-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2">
            <div className="flex items-center gap-2.5">
              <SearchCheck className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-black text-slate-900">Verify Digital Certificate Validity</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">Enter Certificate ID or Roll Number</span>
          </div>

          <form onSubmit={handleSearchCertificate} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={certSearchId}
              onChange={(e) => setCertSearchId(e.target.value)}
              placeholder="e.g. IM-2026-10042 or 240592810..."
              className="flex-1 h-13 px-5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold outline-none focus:bg-white focus:border-blue-500 transition"
              required
            />
            <button
              type="submit"
              disabled={searchingCert}
              className="h-13 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-md active:scale-98 transition cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              <SearchCheck className="w-4 h-4" />
              <span>{searchingCert ? "Verifying..." : "Verify Certificate"}</span>
            </button>
          </form>

          {/* Verification Result Display */}
          {certSearchResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-black uppercase text-emerald-700 tracking-wider">
                    {certSearchResult.status}
                  </span>
                </div>
                <p className="text-sm font-black text-slate-900">{certSearchResult.studentName} — {certSearchResult.domain}</p>
                <p className="text-xs font-bold text-slate-600">ID: {certSearchResult.certificateId} | Issued: {certSearchResult.issueDate}</p>
              </div>
              <span className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase">
                Valid UGC Record
              </span>
            </motion.div>
          )}

          {certError && (
            <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl">
              {certError}
            </p>
          )}
        </div>
      </section>

      {/* 3. FEATURED INTERNSHIP DOMAINS SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <span className="bg-blue-50 text-blue-600 border border-blue-100 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            Explore Programs
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Featured 120-Hour Practical Internship Domains
          </h2>
          <p className="text-sm font-semibold text-slate-500">
            Choose your domain to gain hands-on practical project training, LMS video lectures, and official completion certificate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {domainCourses.map((course, idx) => {
            const IconComp = course.icon;
            return (
              <motion.div
                key={course.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative bg-white border border-slate-200/80 rounded-3xl p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${course.accent} border flex items-center justify-center font-bold shadow-xs`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
                      {course.duration}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-2 leading-relaxed">
                      {course.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-400">
                    Badge: <span className="text-slate-700">{course.badge}</span>
                  </span>
                  <Link to="/register">
                    <button
                      type="button"
                      className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <span>Enroll</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. PLATFORM CORE HIGHLIGHTS */}
      <section className="py-20 bg-slate-100/70 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
              Comprehensive LMS Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Everything You Need For Your Academic Internship
            </h2>
            <p className="text-sm font-semibold text-slate-500">
              Designed according to UGC norms to streamline student learning, task submission, and verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((feat) => (
              <div
                key={feat.title}
                className={`bg-white border rounded-3xl p-7 shadow-xs hover:shadow-md transition-all ${feat.border}`}
              >
                <span className="text-3xl mb-4 block">{feat.icon}</span>
                <h3 className="text-base font-black text-slate-900">{feat.title}</h3>
                <p className="text-xs font-semibold text-slate-500 mt-2 leading-relaxed">{feat.desc}</p>
>>>>>>> 7464cff312050e8e971e9237a62468f802c704a3
              </div>
            ))}
          </div>

<<<<<<< HEAD
        </div>
      </section>

      {/* 12. SUPPORT BANNER */}
      <section className="py-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white relative overflow-hidden w-full text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-4 relative z-10">
              <span className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/15 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                <Headset size={14} />
                24/7 Live Mentor Assistance
              </span>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                Need Help with Student Enrollment or College Guidelines?
              </h2>

              <p className="text-slate-100 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
                Our helpline team is available to assist students, degree college coordinators, and Cyber Cafe partners at every step.
              </p>

              {/* Contact Chips */}
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="mailto:info@internmitra.com"
                  className="flex items-center gap-2 bg-white text-slate-900 px-5 h-11 rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:bg-slate-100 transition cursor-pointer"
                >
                  <Mail size={15} className="text-blue-600" />
                  info@internmitra.com
                </a>
                <a
                  href="tel:+919693921517"
                  className="flex items-center gap-2 bg-white text-slate-900 px-5 h-11 rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:bg-slate-100 transition cursor-pointer"
                >
                  <Phone size={15} className="text-blue-600" />
                  +91 9693921517
                </a>
              </div>
            </div>

            {/* Right Column Illustration */}
            <div className="lg:col-span-4 hidden lg:flex items-center justify-end">
              <img
                src="/support_illustration.png"
                alt="24/7 Support"
                className="h-48 w-auto object-contain drop-shadow-xl"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 13. Sleek Dark Footer */}
      <footer className="bg-[#0b0e1a] text-white pt-20 pb-10 border-t border-slate-900 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 mb-16">

            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-new.jpeg"
                  alt="InternMitra Logo"
                  className="h-12 w-auto object-contain rounded-xl bg-white p-1 shadow-xs"
                />
                <div>
                  <h3 className="font-black text-base tracking-tight text-white">InternMitra</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">UGC Aligned Digital Portal</p>
                </div>
              </div>

              <p className="text-slate-400 leading-relaxed text-xs font-medium max-w-sm">
                Structured digital internship portal providing UGC-aligned training, 120-hour project learning logs, and verified credentials for Bihar colleges.
              </p>

              <div className="flex gap-2.5">
                {[Facebook, Instagram, Twitter, Linkedin, Youtube].map((Icon, index) => (
                  <div
                    key={index}
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-slate-300 hover:text-white" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 mb-5">Platform</h3>
              <ul className="space-y-3 text-slate-400 text-xs font-medium">
                <li><Link to="/features" className="hover:text-blue-400 transition-colors">Features</Link></li>
                <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Portal</Link></li>
                <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact Support</Link></li>
                <li><Link to="/emitra-register" className="hover:text-blue-400 transition-colors">Cyber Cafe Partner</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 mb-5">Portals</h3>
              <ul className="space-y-3 text-slate-400 text-xs font-medium">
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">Student Login</Link></li>
                <li><Link to="/register" className="hover:text-blue-400 transition-colors">Student Registration</Link></li>
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">College HOD Portal</Link></li>
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">Cyber Cafe Portal</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 mb-5">Verification</h3>
              <ul className="space-y-3 text-slate-400 text-xs font-medium">
                <li><a href="#verify" className="hover:text-blue-400 transition-colors">Verify Certificate</a></li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">UGC 120-Hour Guidelines</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Terms & Conditions</li>
              </ul>
=======
        </div>
      </section>

      {/* 5. METRICS & IMPACT COUNTER SECTION */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            
            <div className="p-4 space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-blue-400">50,000+</span>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Enrolled Students</p>
            </div>

            <div className="p-4 space-y-1 pt-6 sm:pt-4">
              <span className="text-3xl sm:text-4xl font-black text-purple-400">500+</span>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Partner Colleges</p>
            </div>

            <div className="p-4 space-y-1 pt-6 sm:pt-4">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400">1,200+</span>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cyber Cafe Partners</p>
            </div>

            <div className="p-4 space-y-1 pt-6 sm:pt-4">
              <span className="text-3xl sm:text-4xl font-black text-amber-400">100%</span>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Verified Certificates</p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. CYBER CAFE PARTNER CALLOUT BANNER */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white shadow-xl overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4 text-center sm:text-left">
              <span className="bg-white/20 border border-white/30 text-white px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                Cyber Cafe & CSC Center Network
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Become an Official InternMitra Cyber Cafe Partner
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-orange-100 max-w-xl leading-relaxed">
                Register students directly from your cafe portal, manage fee receipts, track student enrollments, and earn transparent referral commissions.
              </p>
            </div>

            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <Link to="/emitra-register">
                <button
                  type="button"
                  className="h-14 px-8 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl active:scale-98 transition cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Join Partner Program</span>
                </button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 7. STUDENT & FACULTY TESTIMONIALS SECTION */}
      <section className="py-20 bg-slate-100/70 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="bg-purple-50 text-purple-600 border border-purple-100 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
              Testimonials & Feedback
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Trusted By Students & Faculty Nationwide
            </h2>
            
            {/* Filter Toggle */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewFilter("all")}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  reviewFilter === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                All Reviews
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter("student")}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  reviewFilter === "student"
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Student Reviews
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter("faculty")}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  reviewFilter === "faculty"
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Faculty Reviews
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestimonials.map((t, i) => (
              <div key={i} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed italic">
                    "{t.review}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{t.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400">{t.role}</p>
                  </div>
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                    {t.type}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. FAQ ACCORDION SECTION */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-12">
          <span className="bg-blue-50 text-blue-600 border border-blue-100 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            Got Questions?
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs transition"
            >
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left font-black text-sm text-slate-900 flex items-center justify-between gap-4 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? "rotate-180 text-blue-600" : ""}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs font-semibold text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. FOOTER SECTION */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Column 1: Brand Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src="/logo-new.jpeg" alt="Logo" className="h-10 w-auto rounded-xl border border-slate-700" />
                <span className="font-black text-lg text-white">InternMitra</span>
              </div>
              <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                UGC & AICTE Compliant Digital Internship & Certification Portal empowering degree college students nationwide.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Official Academic Partner</span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Navigation</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-400">
                <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/features" className="hover:text-white transition">Platform Features</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact Support</Link></li>
              </ul>
            </div>

            {/* Column 3: Portals */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Portals & Login</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-400">
                <li><Link to="/login" className="hover:text-white transition">Student Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Student Registration</Link></li>
                <li><Link to="/emitra-register" className="hover:text-white transition">Cyber Cafe Partner Registration</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Admin & Teacher Portal</Link></li>
              </ul>
            </div>

            {/* Column 4: Contact Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Contact & Support</h4>
              <div className="space-y-2 text-xs font-semibold text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <a href="tel:+919693921517" className="hover:text-white transition">+91 9693921517</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <a href="mailto:info@internmitra.com" className="hover:text-white transition">info@internmitra.com</a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Patna, Bihar, India</span>
                </div>
              </div>
>>>>>>> 7464cff312050e8e971e9237a62468f802c704a3
            </div>

          </div>

<<<<<<< HEAD
          <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-400">
            <p>© 2026 InternMitra. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              20,000+ Enrolled Scholars across Bihar
            </div>
=======
          <div className="pt-8 border-t border-slate-800 text-center text-xs font-bold text-slate-500">
            © {new Date().getFullYear()} InternMitra. All Rights Reserved. Compliant with UGC & AICTE Internship Standards.
>>>>>>> 7464cff312050e8e971e9237a62468f802c704a3
          </div>

        </div>
      </footer>

    </div>
  );
}
