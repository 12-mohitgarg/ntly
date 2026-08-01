import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import {
  SearchCheck,
  Download,
  ArrowRight,
  BadgeCheck,
  Users,
  Clock,
  Shield,
  BookOpen,
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
  FileText
} from "lucide-react";
import { generateCertificate } from "./dashboard/generateCertificate";

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [certificateNo, setCertificateNo] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [universities, setUniversities] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const features = [
    {
      title: "Student Interactive Workspace",
      desc: "Personalized dashboard for scholars to manage 120-hour video modules, daily logs, and academic records.",
      icon: "💻",
      tag: "Workspace",
      color: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-200"
    },
    {
      title: "Razorpay Fee Checkout",
      desc: "Seamless, secure enrollment fee payment with automated GST receipts and transaction records.",
      icon: "💳",
      tag: "Payments",
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200"
    },
    {
      title: "Live Progress Tracker",
      desc: "Automated progress benchmarks, assignment verification logs, and active session hours monitor.",
      icon: "📈",
      tag: "Analytics",
      color: "from-violet-500/10 to-purple-500/10 text-violet-600 border-violet-200"
    },
    {
      title: "UGC 120-Hour LMS Library",
      desc: "Comprehensive video lectures, downloadable notes, reference materials, and project handouts.",
      icon: "🎓",
      tag: "Curriculum",
      color: "from-amber-500/10 to-orange-500/10 text-orange-600 border-orange-200"
    },
    {
      title: "Instant QR Credentials",
      desc: "One-click generation and employer-ready verification of completion certificates & marksheets.",
      icon: "📜",
      tag: "Credentials",
      color: "from-sky-500/10 to-cyan-500/10 text-sky-600 border-sky-200"
    },
    {
      title: "Cyber Cafe Partner Network",
      desc: "Authorized eMitra & Cyber Cafe partners across Bihar for hassle-free student registration & onboarding.",
      icon: "🤝",
      tag: "Partner Network",
      color: "from-pink-500/10 to-rose-500/10 text-rose-600 border-rose-200"
    }
  ];

  const allTestimonials = [
    {
      name: "Rahul Kumar",
      role: "B.Tech Student • Patliputra Univ",
      type: "Student",
      review: "InternMitra made my 120-hour mandatory internship extremely smooth. The video modules and logbook system are top class!"
    },
    {
      name: "Priya Sharma",
      role: "BCA Student • Magadh Univ",
      type: "Student",
      review: "The digital certificate verification worked instantly when submitting to my college placement cell. Highly recommended!"
    },
    {
      name: "Aman Raj",
      role: "B.Sc Student • AKU Patna",
      type: "Student",
      review: "Clean user dashboard, excellent study material, and quick certificate generation after quiz completion."
    },
    {
      name: "Dr. Rajesh Kumar",
      role: "Department Head • Patna University",
      type: "Teacher",
      review: "InternMitra simplifies mandatory UGC internship management for our entire batch with verified digital logbooks."
    },
    {
      name: "Anjali Sinha",
      role: "Academic Coordinator • VKSU",
      type: "Teacher",
      review: "Structured course material and transparent attendance tracking make it an ideal choice for colleges."
    },
    {
      name: "Abhishek Sir",
      role: "Technical Mentor",
      type: "Teacher",
      review: "The curriculum aligns directly with UGC standards, preparing Bihar students for real industry requirements."
    }
  ];

  const faqs = [
    {
      q: "Is InternMitra's 120-Hour Internship recognized under UGC & AICTE guidelines?",
      a: "Yes! InternMitra's internship modules are specifically structured according to UGC & AICTE curriculum guidelines for 120-hour practical learning logs, required for undergraduate and vocational degree programs across universities in Bihar."
    },
    {
      q: "How does digital certificate verification work?",
      a: "Every certificate issued contains a unique Certificate Registration Number (e.g. IM-2026-XXXX) and a secure QR code. Employers and universities can verify credentials anytime using the verification tool on our homepage."
    },
    {
      q: "Can Cyber Cafes / eMitra centers register students?",
      a: "Absolutely! Cyber Cafes across Bihar can register as official Cyber Cafe Partners to enroll students, manage registrations, and earn partner commissions directly."
    },
    {
      q: "How do students access video lectures and submit logbooks?",
      a: "Once enrolled, students get immediate access to their personal Student Workspace where they can view daily video lectures, download learning materials, and update their digital internship logbook."
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
    }
  };

  const verifyCertificate = async () => {
    if (!certificateNo) {
      alert("Please enter a valid certificate number");
      return;
    }
    try {
      setVerifying(true);
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("certificateNumber", "==", certificateNo.trim()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("Certificate not found. Please check your certificate number and try again.");
        setVerifying(false);
        return;
      }

      const userData = snapshot.docs[0].data();
      await generateCertificate(userData, snapshot.docs[0].id);
      setVerifying(false);
    } catch (error) {
      console.error(error);
      alert("Error verifying certificate. Please try again.");
      setVerifying(false);
    }
  };

  const filteredTestimonials =
    activeFilter === "All"
      ? allTestimonials
      : allTestimonials.filter((item) => item.type === activeFilter);

  return (
    <div className="bg-[#f8fafc] text-slate-900 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* WHITE THEME TOP ANNOUNCEMENT TICKER */}
      <div className="bg-blue-900 text-white text-[11px] sm:text-xs font-bold py-2.5 px-4 text-center tracking-wider overflow-hidden whitespace-nowrap border-b border-blue-950 flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 shadow-xs">
          <Sparkles size={11} /> 2026 BATCH
        </span>
        <motion.div
          animate={{ x: [500, -500] }}
          transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
          className="inline-block font-semibold text-blue-100"
        >
          🎓 Registrations Open for 2023-2027 & 2024-2028 Academic Batches • UGC Aligned 120-Hour Mandatory Digital Internships
        </motion.div>
      </div>

      {/* WHITE THEME HERO SECTION */}
      <section className="relative bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-14 pb-20 md:pt-20 md:pb-24 border-b border-slate-200/60">
        {/* Background blobs */}
        <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 text-left space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full shadow-xs">
                <BadgeCheck className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                  UGC & AICTE Compliant Portal • Bihar
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-slate-900">
                Bihar's Leading UGC
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 mt-1">
                  Digital Internship Platform
                </span>
                for Colleges & Scholars
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
                InternMitra provides Bihar's students with structured 120-hour industry internship modules, verified digital logbooks, instant QR certificates, and placement mentorship.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/register">
                  <button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2.5 cursor-pointer">
                    <span>Start Student Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>

                <a href="#verify">
                  <button className="bg-white border border-slate-300 text-slate-700 hover:text-blue-600 hover:border-blue-300 px-7 h-14 rounded-2xl font-black uppercase text-xs tracking-widest transition-all duration-300 shadow-xs flex items-center gap-2 cursor-pointer">
                    <SearchCheck className="w-4 h-4 text-blue-600" />
                    <span>Verify Certificate</span>
                  </button>
                </a>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200/80">
                {[
                  { value: "20,000+", label: "Enrolled Scholars" },
                  { value: "120 Hours", label: "Structured Study" },
                  { value: "100%", label: "UGC Compliant" },
                  { value: "Instant QR", label: "Verification" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs text-left">
                    <h3 className="text-xl sm:text-2xl font-black text-blue-900">{stat.value}</h3>
                    <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Column Image Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl blur-2xl opacity-15" />
                
                <div className="bg-white p-4 rounded-3xl border border-slate-200/80 relative z-10 shadow-xl">
                  <img
                    src="/home-internship-hero.jpg"
                    alt="Students learning with internship dashboard"
                    className="rounded-2xl h-[300px] md:h-[380px] object-cover w-full shadow-inner"
                  />

                  {/* Floating badge cards */}
                  <div className="absolute -bottom-5 -left-5 bg-white p-3.5 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s' }}>
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100 shrink-0">
                      <Award size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Certification</p>
                      <p className="text-xs font-black text-slate-900">UGC Compliant</p>
                    </div>
                  </div>

                  <div className="absolute -top-5 -right-5 bg-white p-3 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">MSME Certified</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* STATS HIGHLIGHT STRIP */}
      <section className="bg-slate-900 text-white py-12 border-y border-slate-800 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">20,000+</p>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Active Scholars</p>
            </div>
            <div className="pt-6 md:pt-0">
              <p className="text-3xl sm:text-4xl font-extrabold text-white">150+</p>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Associated Colleges</p>
            </div>
            <div className="pt-6 md:pt-0">
              <p className="text-3xl sm:text-4xl font-extrabold text-white">100%</p>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Digital Logbooks</p>
            </div>
            <div className="pt-6 md:pt-0">
              <p className="text-3xl sm:text-4xl font-extrabold text-white">99.2%</p>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Verification Pass Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CERTIFICATE VERIFICATION SECTION (WHITE THEME) */}
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
                  className="text-blue-600 hover:underline font-bold cursor-pointer"
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
                  className="h-14 px-8 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-orange-500/10 active:scale-[0.98] cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  {verifying ? "VERIFYING..." : "VERIFY & DOWNLOAD"}
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PLATFORM FEATURES GRID */}
      <section className="py-24 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 bg-blue-50 px-3.5 py-1 rounded-md inline-block">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Powerful Tools For <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Complete Management</span>
            </h2>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed">
              InternMitra handles everything from learning to verified digital credentials, backed by industry standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((item, index) => (
              <motion.div
                whileHover={{ y: -5 }}
                key={index}
                className="bg-slate-50/60 hover:bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} border flex items-center justify-center text-2xl shadow-xs`}>
                      {item.icon}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-500">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 mb-3 tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-slate-500 leading-relaxed text-sm font-semibold">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 4-STEP WORKFLOW */}
      <section className="py-24 bg-slate-50/80 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 bg-blue-50 px-3.5 py-1 rounded-md inline-block">
              Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Get Certified in <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">4 Easy Steps</span>
            </h2>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed">
              Your step-by-step roadmap to successful program completion and credentialing.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-16 right-16 h-0.5 bg-slate-200 z-0" />

            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {[
                {
                  title: "Register Profile",
                  desc: "Fill in academic details, college name, and choose your internship track."
                },
                {
                  title: "Instant Enrollment",
                  desc: "Complete enrollment payment via secure Razorpay checkout to activate dashboard."
                },
                {
                  title: "Learn & Upload",
                  desc: "Attend structured video hours, check resource materials, and submit daily reports."
                },
                {
                  title: "Earn Certificate",
                  desc: "Clear final quiz criteria to download your verified digital credentials."
                }
              ].map((item, index) => (
                <div key={index} className="text-center flex flex-col items-center group">
                  <div className="w-18 h-18 rounded-2xl bg-white border border-slate-200 shadow-xs text-blue-600 flex items-center justify-center text-xl font-black mb-5 relative group-hover:border-blue-400 transition-colors">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg px-2 py-0.5 text-[9px] font-black absolute -top-3 -right-3 shadow-md shadow-orange-500/10">
                      0{index + 1}
                    </span>
                    🎓
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mb-2 tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-slate-500 leading-relaxed text-xs font-semibold max-w-xs">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* UNIVERSITIES COVERED */}
      <section className="py-20 bg-white overflow-hidden border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 bg-blue-50 px-3.5 py-1 rounded-md inline-block">
              Institutions
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Associated Universities & Colleges
            </h2>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed">
              Recognized framework aligned across top state partner institutions in Bihar.
            </p>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex gap-6 whitespace-nowrap py-3"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          >
            {[...displayUniversities, ...displayUniversities].map((item, index) => (
              <div
                key={index}
                className="inline-block min-w-[270px] bg-slate-50 rounded-2xl p-5 border border-slate-200/80 shadow-xs"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg text-blue-600 border border-blue-100 shrink-0">
                    🏫
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800 whitespace-normal line-clamp-1 max-w-[180px]">
                      {item.name}
                    </h3>
                    <p className="text-[8px] text-green-600 font-extrabold uppercase tracking-wider mt-0.5">
                      Partner Institution
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 bg-blue-50 px-3.5 py-1 rounded-md inline-block">
              Feedback
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Scholars & Faculty Reviews
            </h2>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed">
              Read real-world feedback from students and training heads who finished our modules.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex justify-center mb-12">
            <div className="bg-white shadow-xs rounded-2xl p-1 flex gap-1 border border-slate-200">
              {["All", "Students", "Teachers"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter === "Students" ? "Student" : filter === "Teachers" ? "Teacher" : "All")}
                  className={`px-6 py-2 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${(filter === "All" && activeFilter === "All") ||
                    (filter === "Students" && activeFilter === "Student") ||
                    (filter === "Teachers" && activeFilter === "Teacher")
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* TESTIMONIAL GRID */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTestimonials.slice(0, 6).map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -3 }}
                className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between text-left"
              >
                <div>
                  <div className="flex gap-0.5 mb-4 text-amber-500 text-sm">
                    {"★".repeat(5)}
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm font-semibold italic mb-6">
                    "{item.review}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-extrabold text-xs shadow-xs">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                        {item.role}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${item.type === "Student"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-blue-50 text-blue-600 border border-blue-100"
                    }`}>
                    {item.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 bg-white border-b border-slate-200/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 bg-blue-50 px-3 py-1 rounded-md inline-block">
              Help Center
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed">
              Everything you need to know about enrollment, certification, and AICTE compliance.
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
                  className="w-full p-6 text-left flex justify-between items-center gap-4 font-black text-sm text-slate-900 hover:text-blue-600 cursor-pointer"
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
                      className="px-6 pb-6 text-xs font-semibold text-slate-600 leading-relaxed border-t border-slate-100 pt-4"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SUPPORT BANNER */}
      <section className="py-10 md:py-14 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden w-full text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left text elements */}
            <div className="lg:col-span-7 space-y-5 relative z-10">
              <span className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/10 px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider">
                <Headset size={13} />
                We're Here to Help
              </span>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-none text-white">
                24/7 Live <br className="hidden sm:inline" />
                Mentor <span className="text-blue-200">Support</span>
              </h2>

              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-xl font-semibold">
                Have questions? Our support team and expert trainers are here to guide you at every step of your journey.
              </p>

              {/* Sub features row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center text-white py-1">
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                    <MessageCircle size={14} />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[11px] font-black uppercase tracking-tight">Instant Solutions</h4>
                    <p className="text-[9px] text-slate-200 font-semibold leading-normal">Get quick answers to your queries.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start sm:border-l sm:border-white/10 sm:pl-5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                    <Users size={14} />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-[11px] font-black uppercase tracking-tight">Expert Guidance</h4>
                    <p className="text-[9px] text-slate-200 font-semibold leading-normal">Learn from industry professionals.</p>
                  </div>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <a
                  href="mailto:info@internmitra.com"
                  className="flex items-center justify-center gap-2.5 bg-white text-slate-800 px-5 h-11 rounded-lg font-black text-[11px] uppercase tracking-wider shadow-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  <Mail size={14} className="text-blue-600" />
                  info@internmitra.com
                </a>
                <a
                  href="tel:+919693921517"
                  className="flex items-center justify-center gap-2.5 bg-white text-slate-800 px-5 h-11 rounded-lg font-black text-[11px] uppercase tracking-wider shadow-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  <Phone size={14} className="text-blue-600" />
                  +91 9693921517
                </a>
              </div>
            </div>

            {/* Right illustration / graphics */}
            <div className="lg:col-span-5 relative hidden lg:flex items-center justify-center">
              {/* Floating icon cards */}
              <div className="absolute top-2 left-6 w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/80 font-black text-[10px] tracking-tight animate-pulse">
                24/7
              </div>
              <div className="absolute bottom-2 left-12 w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/85">
                <ShieldCheck size={14} />
              </div>
              <div className="absolute bottom-12 right-6 w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/85">
                <Award size={16} />
              </div>

              <img
                src="/support_illustration.png"
                alt="24/7 Live Mentor Support"
                className="h-44 md:h-52 w-auto object-contain relative z-10 drop-shadow-md"
              />

              <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            </div>
          </div>

          {/* Bottom transparent stats overlay bar */}
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-5 items-center text-white">
            {[
              { title: 'Always Available', desc: 'We\'re here for you, anytime, anywhere.', icon: Clock },
              { title: 'Trusted Support', desc: 'Reliable help from verified experts.', icon: ShieldCheck },
              { title: 'Quick Response', desc: 'Fast and effective assistance.', icon: Zap },
              { title: 'Your Success Matters', desc: 'We\'re committed to your learning journey.', icon: Heart }
            ].map((node, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/5 shadow-xs">
                  <node.icon size={15} />
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-[10px] font-black text-white uppercase tracking-tight leading-none mb-0.5">{node.title}</h5>
                  <p className="text-[9px] text-slate-200 font-semibold leading-normal">{node.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0b0e1a] text-white pt-20 pb-10 border-t border-slate-900 text-left select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 mb-16">

            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-new.jpeg"
                  alt="InternMitra Logo"
                  className="h-12 w-auto object-contain rounded-xl bg-white p-1 shadow-xs"
                />
              </div>

              <p className="text-slate-400 leading-relaxed text-xs sm:text-sm font-semibold max-w-sm">
                Structured digital internship portal providing industry-aligned training, project learning logs, and verified credentials.
              </p>

              <div className="flex gap-2.5">
                {[Facebook, Instagram, Twitter, Linkedin, Youtube].map((Icon, index) => (
                  <div
                    key={index}
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-300 mb-6">Platform</h3>
              <ul className="space-y-3.5 text-slate-400 text-xs font-semibold">
                <li><Link to="/features" className="hover:text-blue-400 transition-colors">Features</Link></li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">For Students</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">For Colleges</li>
                <li><Link to="/emitra-register" className="hover:text-blue-400 transition-colors">Cyber Cafe Partner</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-300 mb-6">Support</h3>
              <ul className="space-y-3.5 text-slate-400 text-xs font-semibold">
                <li className="hover:text-blue-400 cursor-pointer transition-colors">FAQs</li>
                <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact us</Link></li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Credentials</li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-300 mb-6">Legal</h3>
              <ul className="space-y-3.5 text-slate-400 text-xs font-semibold">
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Terms & Conditions</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Refund Policy</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Cookie Settings</li>
              </ul>
            </div>

          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-semibold text-slate-500">
            <p>© 2026 InternMitra. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-blue-500/80" />
              20,000+ Registered Scholars
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
