import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { query, where } from "firebase/firestore";
import { SearchCheck, Download } from "lucide-react";
import { generateCertificate } from "./dashboard/generateCertificate";
import {
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
} from "lucide-react";

export default function Home() {
  const features = [
    {
      title: "Student Registration",
      desc: "Simple and secure registration process without document verification.",
      icon: "📝",
    },
    {
      title: "Payment Integration",
      desc: "Secure Razorpay integration for reimbursements and payments.",
      icon: "💳",
    },
    {
      title: "Progress Tracking",
      desc: "Track internship and learning progress in real time.",
      icon: "📊",
    },
    {
      title: "Assessment System",
      desc: "Assignments and quizzes for student evaluation.",
      icon: "📱",
    },
    {
      title: "Learning Management",
      desc: "17 subjects with PPTs, videos and learning materials.",
      icon: "🎓",
    },
    {
      title: "Certificate Generation",
      desc: "Automatic internship certificate generation system.",
      icon: "🏆",
    },
  ];

  const allTestimonials = [
    {
      name: "Rahul Kumar",
      role: "B.Tech Student",
      type: "Student",
      review:
        "Internmitra helped me gain real internship experience with live projects.",
    },
    {
      name: "Priya Sharma",
      role: "MBA Student",
      type: "Student",
      review:
        "The training sessions and internship tasks were very practical.",
    },
    {
      name: "Aman Raj",
      role: "BCA Student",
      type: "Student",
      review:
        "Amazing platform for students and certification support.",
    },
    {
      name: "Neha Singh",
      role: "BBA Student",
      type: "Student",
      review:
        "Very professional internship management system.",
    },
    {
      name: "Ritesh Kumar",
      role: "MCA Student",
      type: "Student",
      review:
        "Mentorship support was excellent throughout the internship.",
    },
    {
      name: "Pooja Verma",
      role: "B.Sc Student",
      type: "Student",
      review:
        "Internmitra improved my communication and technical skills.",
    },
    {
      name: "Dr. Rajesh Kumar",
      role: "College Professor",
      type: "Teacher",
      review:
        "Very useful internship platform for colleges and students.",
    },
    {
      name: "Anjali Sinha",
      role: "Training Mentor",
      type: "Teacher",
      review:
        "Easy dashboard and proper internship workflow system.",
    },
    {
      name: "Deepak Sir",
      role: "Faculty",
      type: "Teacher",
      review:
        "Professional certification and tracking process.",
    },
    {
      name: "Ravi Sir",
      role: "Placement Trainer",
      type: "Teacher",
      review:
        "Students are getting real industry exposure.",
    },
    {
      name: "Meena Ma'am",
      role: "Mentor",
      type: "Teacher",
      review:
        "Excellent support and learning management.",
    },
    {
      name: "Abhishek Sir",
      role: "Technical Trainer",
      type: "Teacher",
      review:
        "One of the best internship platforms for students.",
    },
  ];

  const [activeFilter, setActiveFilter] = useState("All");
  const [certificateNo, setCertificateNo] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [universities, setUniversities] = useState<any[]>([]);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {

    try {

      const snapshot = await getDocs(
        collection(db, "universities")
      );

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

      alert("Please enter certificate number");

      return;
    }

    try {

      setVerifying(true);

      const usersRef = collection(db, "users");

      const q = query(
        usersRef,
        where(
          "certificateNumber",
          "==",
          certificateNo
        )
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {

        alert("Certificate not found");

        setVerifying(false);

        return;
      }

      const userData =
        snapshot.docs[0].data();

      await generateCertificate(
        userData,
        snapshot.docs[0].id
      );

      setVerifying(false);

    } catch (error) {

      console.error(error);

      alert("Error verifying certificate");

      setVerifying(false);
    }
  };
  const filteredTestimonials =
    activeFilter === "All"
      ? allTestimonials
      : allTestimonials.filter((item) => item.type === activeFilter);

  return (
    <div className="bg-[#f8fafc] overflow-hidden">

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-[#060814] via-[#0b132b] to-[#04060d] text-white pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/10 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-indigo-600/10 rounded-full blur-[100px] md:blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/10 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-purple-600/10 rounded-full blur-[100px] md:blur-[130px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 text-left"
            >
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-400/20 px-4 py-2 rounded-full mb-6 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                <BadgeCheck className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300">UGC Compliant Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] mb-6 tracking-tight">
                Empowering Students With
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300 mt-2">
                  Industry-Ready Skills
                </span>
                & Verified Certifications
              </h1>

              <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl font-medium">
                InternMitra is India's leading internship management platform. Learn with live sessions, structured syllabus, real-time tracking, placement mentors, and get verified certification.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <button className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-white shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2">
                    Register Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>

                <Link to="/login">
                  <button className="border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                    Login
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 pt-8 border-t border-white/5">
                {[
                  { value: "10K+", label: "Students Trained" },
                  { value: "120 Hrs", label: "Structured Course" },
                  { value: "99%", label: "Placement Help" },
                  { value: "24/7", label: "Mentor Support" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 text-center">
                    <h3 className="text-2xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">{stat.value}</h3>
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative glow behind image */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] blur-2xl opacity-20" />
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-3 rounded-[2.5rem] border border-white/10 relative z-10 backdrop-blur-md shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop"
                    alt="Students studying together"
                    className="rounded-[2rem] h-[350px] md:h-[420px] object-cover w-full shadow-inner"
                  />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* CERTIFICATE VERIFY */}
      <section className="py-24 bg-[#fafbfc] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 md:p-14 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-400/20 px-4 py-2 rounded-full mb-6">
                <SearchCheck className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300">
                  Verify Credentials
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                Download Verified <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">Internship Certificate</span>
              </h2>

              <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto mb-8 font-medium">
                Enter your certificate number to instantly verify and download your official, UGC-compliant digital certificate. Secured and verified by InternMitra.
              </p>

              <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="e.g. IM-2026-XXXX"
                  value={certificateNo}
                  onChange={(e) => setCertificateNo(e.target.value)}
                  className="flex-1 h-14 px-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-base font-semibold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                />

                <button
                  onClick={verifyCertificate}
                  disabled={verifying}
                  className="h-14 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  {verifying ? "VERIFYING..." : "VERIFY & DOWNLOAD"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md inline-block mb-3">Dashboard Hub</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">
              Powerful Features For <span className="gradient-text">Complete Management</span>
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-semibold leading-relaxed">
              InternMitra handles everything from learning to verified digital credentials, backed by industry standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Student Workspace",
                desc: "Beautiful personal dashboard to track lectures, tasks, attendance, and documents.",
                icon: "📝",
                color: "from-orange-500/10 to-amber-500/10 text-orange-600 border-orange-100"
              },
              {
                title: "Razorpay Checkout",
                desc: "Secure instant enrollment, receipt generation, and fee receipt download system.",
                icon: "💳",
                color: "from-blue-500/10 to-cyan-500/10 text-blue-600 border-blue-100"
              },
              {
                title: "Live Progress Monitor",
                desc: "Monitor your completion benchmarks, assignment statuses, and active session hours.",
                icon: "📊",
                color: "from-indigo-500/10 to-violet-500/10 text-indigo-600 border-indigo-100"
              },
              {
                title: "Assessments & Quizzes",
                desc: "Integrated tests to evaluate domain comprehension and get feedback metrics.",
                icon: "📱",
                color: "from-pink-500/10 to-fuchsia-500/10 text-pink-600 border-pink-100"
              },
              {
                title: "Rich LMS Library",
                desc: "Access video lectures, PPT notes, reference codes, and curriculum handouts.",
                icon: "🎓",
                color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-100"
              },
              {
                title: "Auto Certificates",
                desc: "One-click generation of verified completion certificates and marksheet records.",
                icon: "🏆",
                color: "from-yellow-500/10 to-amber-500/10 text-yellow-600 border-yellow-100"
              }
            ].map((item, index) => (
              <motion.div
                whileHover={{ y: -6 }}
                key={index}
                className="bg-slate-50/50 hover:bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-[0_20px_50px_-12px_rgba(79,70,229,0.06)] hover:border-indigo-100/50 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} border flex items-center justify-center text-2xl mb-6 shadow-sm`}>
                  {item.icon}
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">
                  {item.title}
                </h3>

                <p className="text-slate-500 leading-relaxed text-sm font-semibold">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* SIMPLE STEPS */}
      <section className="py-24 bg-[#fafbfc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md inline-block mb-3">Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">
              Get Certified in <span className="gradient-text">4 Easy Steps</span>
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-semibold leading-relaxed">
              Your step-by-step roadmap to successful program completion and credentialing.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-12 right-12 h-0.5 bg-slate-200/60 z-0" />

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
                  desc: "Attend structured video hours, check resource materials, and submit reports."
                },
                {
                  title: "Earn Certificate",
                  desc: "Clear final quiz criteria to download your verified digital credentials."
                }
              ].map((item, index) => (
                <div key={index} className="text-center flex flex-col items-center">
                  <div className="w-18 h-18 rounded-2xl bg-white border border-slate-200/80 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.05)] text-indigo-600 flex items-center justify-center text-xl font-black mb-5 relative hover:border-indigo-300 transition-colors">
                    <span className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-lg px-2.5 py-1 text-xs absolute -top-3 -right-3 shadow-md shadow-indigo-600/10">0{index + 1}</span>
                    🎓
                  </div>

                  <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-slate-500 leading-relaxed text-xs sm:text-sm font-semibold max-w-xs">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* UNIVERSITIES */}
      <section className="py-24 bg-white overflow-hidden border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md inline-block mb-3">Coverage</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">
              Universities and Colleges <span className="gradient-text">We Work With</span>
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-semibold leading-relaxed">
              UGC compliant industrial framework recognized across top partner institutions.
            </p>
          </div>

        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Fading gradient covers on left and right for seamless look */}
          <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          
          <motion.div
            className="flex gap-6 whitespace-nowrap py-4"
            animate={{
              x: ["0%", "-50%"]
            }}
            transition={{
              repeat: Infinity,
              duration: 35,
              ease: "linear"
            }}
          >
            {[...universities, ...universities].map((item, index) => (
              <div
                key={index}
                className="inline-block min-w-[280px] bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl text-indigo-600">
                    🏫
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 whitespace-normal line-clamp-1 max-w-[200px]">
                      {item.name}
                    </h3>
                    <p className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider mt-0.5">
                      Partner Institute
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-[#fafbfc] border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md inline-block mb-3">Feedback</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">
              Scholars and Mentors <span className="gradient-text">Love InternMitra</span>
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-semibold leading-relaxed">
              Read real-world reviews from learners across technical and management domains.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex justify-center mb-12">
            <div className="bg-white shadow-md rounded-2xl p-1.5 flex gap-1 border border-slate-100">
              {["All", "Students", "Teachers"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter === "Students" ? "Student" : filter === "Teachers" ? "Teacher" : "All")}
                  className={`px-6 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all duration-300 ${
                    (filter === "All" && activeFilter === "All") ||
                    (filter === "Students" && activeFilter === "Student") ||
                    (filter === "Teachers" && activeFilter === "Teacher")
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
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
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-0.5 mb-4 text-yellow-400 text-sm">
                    {"★".repeat(5)}
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm font-semibold italic mb-6">
                    "{item.review}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-600/10">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                        {item.role}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                    item.type === "Student"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                  }`}>
                    {item.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* INTERNSHIP FLOW */}
      <section className="py-24 bg-slate-950 text-white relative">
        <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-indigo-400 bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 rounded-md inline-block mb-3">Milestones</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
              Structured Digital Internship Path
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-medium">
              A comprehensive checklist milestones timeline from onboarding registration to certificate release.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "Profile Registration",
              "Razorpay Enrollment Payment",
              "Access Learning Dashboard",
              "Complete Daily Videos",
              "Submit Assignment Reports",
              "Generate Final Certificates",
            ].map((step, index) => (
              <div
                key={index}
                className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest bg-indigo-400/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                    Step 0{index + 1}
                  </span>
                  <span className="bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <h3 className="text-lg font-black text-white mb-4 tracking-tight">
                  {step}
                </h3>

                <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-400">✔</span> Industry standard syllabus
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-400">✔</span> Realtime dashboard log
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-400">✔</span> Online test verification
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECHNOLOGY */}
      <section className="py-24 bg-[#030612] text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-indigo-400 bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 rounded-md inline-block mb-3">Infrastructure</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
              Enterprise Grade Performance
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-medium">
              Powered by advanced cloud-native architecture ensuring low latency learning access.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: <Users className="w-6 h-6 text-indigo-400" />,
                title: "500K+ Concurrent Capacity",
              },
              {
                icon: <Clock className="w-6 h-6 text-indigo-400" />,
                title: "Ultra Low Latency Streaming",
              },
              {
                icon: <Shield className="w-6 h-6 text-indigo-400" />,
                title: "Advanced Data Security",
              },
              {
                icon: <BookOpen className="w-6 h-6 text-indigo-400" />,
                title: "Real-time Progress Logs",
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-indigo-400" />,
                title: "Interactive Syllabus Grids",
              },
              {
                icon: <Shield className="w-6 h-6 text-indigo-400" />,
                title: "99.9% High Availability",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/[0.01] border border-white/[0.03] rounded-3xl p-6 hover:border-indigo-500/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 border border-indigo-400/10 shadow-inner">
                  {item.icon}
                </div>

                <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>

        </div>
      </section>
          {/* SUPPORT */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-violet-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(6,182,212,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center px-4 relative z-10">

          <h2 className="text-4xl font-black mb-4 tracking-tight">
            24/7 Live Mentor Support
          </h2>

          <p className="text-base text-indigo-100 mb-10 font-medium">
            Have questions? Our support team and expert trainers are here to guide you.
          </p>

          <div className="flex flex-wrap justify-center gap-8 font-semibold">

            <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-sm">
              <Mail className="w-5 h-5 text-cyan-300" />
              info@internmitra.com
            </div>

            <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-sm">
              <Phone className="w-5 h-5 text-cyan-300" />
              +91 9693921517
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-white pt-20 pb-10 border-t border-slate-900">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid lg:grid-cols-5 gap-10 mb-16">

            <div className="lg:col-span-2">

              <div className="flex items-center gap-3 mb-6">

                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/10">
                  IM
                </div>

                <div>
                  <h2 className="text-2xl font-black tracking-tight">
                    InternMitra
                  </h2>

                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-0.5">
                    Empowering Scholars
                  </p>
                </div>

              </div>

              <p className="text-slate-400 leading-relaxed text-sm font-semibold mb-8 max-w-sm">
                Structured digital internship portal providing industry training, project-based learning logs, and verified credentials.
              </p>

              <div className="flex gap-3 mb-8">

                {[Facebook, Instagram, Twitter, Linkedin, Youtube].map(
                  (Icon, index) => (

                    <div
                      key={index}
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                  )
                )}

              </div>

              <div className="space-y-3.5 text-sm text-slate-400 font-semibold">

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  info@internmitra.com
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-indigo-400" />
                  +91 9693921517
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-indigo-400 mt-1" />
                  Patna, Bihar, India
                </div>

              </div>

            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">
                Platform
              </h3>

              <ul className="space-y-3.5 text-slate-400 text-sm font-semibold">
                <li>
                  <Link
                    to="/features"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li className="hover:text-indigo-400 cursor-pointer">Pricing</li>
                <li className="hover:text-indigo-400 cursor-pointer">For Students</li>
                <li className="hover:text-indigo-400 cursor-pointer">For Colleges</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">
                Support
              </h3>

              <ul className="space-y-3.5 text-slate-400 text-sm font-semibold">
                <li className="hover:text-indigo-400 cursor-pointer">FAQs</li>
                <li>
                  <Link
                    to="/about"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Contact us
                  </Link>
                </li>
                <li className="hover:text-indigo-400 cursor-pointer">Credentials</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">
                Legal
              </h3>

              <ul className="space-y-3.5 text-slate-400 text-sm font-semibold">
                <li className="hover:text-indigo-400 cursor-pointer">Privacy Policy</li>
                <li className="hover:text-indigo-400 cursor-pointer">Terms & Conditions</li>
                <li className="hover:text-indigo-400 cursor-pointer">Refund Policy</li>
                <li className="hover:text-indigo-400 cursor-pointer">Cookie Settings</li>
              </ul>
            </div>

          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-500">

            <p>
              © 2026 Internmitra. All rights reserved.
            </p>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400/80" />
              20,000+ Registered Scholars
            </div>

          </div>

        </div>
      </footer>

    </div>
  );
}