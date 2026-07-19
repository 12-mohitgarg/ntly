import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import { SearchCheck, Download, ArrowRight, BadgeCheck, Users, Clock, Shield, BookOpen, BarChart3, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin, Youtube, Award, CheckCircle2, MessageCircle, Heart, Zap, Headset, ShieldCheck } from "lucide-react";
import { generateCertificate } from "./dashboard/generateCertificate";

export default function Home() {
  const features = [
    {
      title: "Student Workspace",
      desc: "Beautiful personal dashboard to track lectures, tasks, attendance, and documents.",
      icon: "📝",
      color: "from-orange-500/10 to-amber-500/10 text-orange-600 border-orange-100/60"
    },
    {
      title: "Razorpay Checkout",
      desc: "Secure instant enrollment, receipt generation, and fee receipt download system.",
      icon: "💳",
      color: "from-blue-500/10 to-cyan-500/10 text-blue-600 border-blue-100/60"
    },
    {
      title: "Live Progress Monitor",
      desc: "Monitor your completion benchmarks, assignment statuses, and active session hours.",
      icon: "📊",
      color: "from-indigo-500/10 to-violet-500/10 text-indigo-600 border-indigo-100/60"
    },
    {
      title: "Assessments & Quizzes",
      desc: "Integrated tests to evaluate domain comprehension and get feedback metrics.",
      icon: "📱",
      color: "from-pink-500/10 to-fuchsia-500/10 text-pink-600 border-pink-100/60"
    },
    {
      title: "Rich LMS Library",
      desc: "Access video lectures, PPT notes, reference codes, and curriculum handouts.",
      icon: "🎓",
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-100/60"
    },
    {
      title: "Auto Certificates",
      desc: "One-click generation of verified completion certificates and marksheet records.",
      icon: "🏆",
      color: "from-yellow-500/10 to-amber-500/10 text-yellow-600 border-yellow-100/60"
    }
  ];

  const allTestimonials = [
    {
      name: "Rahul Kumar",
      role: "B.Tech Student",
      type: "Student",
      review: "Internmitra helped me gain real internship experience with live projects."
    },
    {
      name: "Priya Sharma",
      role: "MBA Student",
      type: "Student",
      review: "The training sessions and internship tasks were very practical."
    },
    {
      name: "Aman Raj",
      role: "BCA Student",
      type: "Student",
      review: "Amazing platform for students and certification support."
    },
    {
      name: "Neha Singh",
      role: "BBA Student",
      type: "Student",
      review: "Very professional internship management system."
    },
    {
      name: "Ritesh Kumar",
      role: "MCA Student",
      type: "Student",
      review: "Mentorship support was excellent throughout the internship."
    },
    {
      name: "Pooja Verma",
      role: "B.Sc Student",
      type: "Student",
      review: "Internmitra improved my communication and technical skills."
    },
    {
      name: "Dr. Rajesh Kumar",
      role: "College Professor",
      type: "Teacher",
      review: "Very useful internship platform for colleges and students."
    },
    {
      name: "Anjali Sinha",
      role: "Training Mentor",
      type: "Teacher",
      review: "Easy dashboard and proper internship workflow system."
    },
    {
      name: "Deepak Sir",
      role: "Faculty",
      type: "Teacher",
      review: "Professional certification and tracking process."
    },
    {
      name: "Ravi Sir",
      role: "Placement Trainer",
      type: "Teacher",
      review: "Students are getting real industry exposure."
    },
    {
      name: "Meena Ma'am",
      role: "Mentor",
      type: "Teacher",
      review: "Excellent support and learning management."
    },
    {
      name: "Abhishek Sir",
      role: "Technical Trainer",
      type: "Teacher",
      review: "One of the best internship platforms for students."
    }
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
      alert("Please enter certificate number");
      return;
    }
    try {
      setVerifying(true);
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("certificateNumber", "==", certificateNo));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("Certificate not found");
        setVerifying(false);
        return;
      }

      const userData = snapshot.docs[0].data();
      await generateCertificate(userData, snapshot.docs[0].id);
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
      {/* Announcement bar */}
      <div className="bg-blue-900 text-white text-[10px] sm:text-xs font-bold py-2.5 px-4 text-center tracking-wider overflow-hidden whitespace-nowrap">
        <motion.div
          animate={{ x: [600, -600] }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
          className="inline-block"
        >
          🎓 Registrations Open for 2026-2027 Academic Batch • UGC-Mandated 120-Hour Internships
        </motion.div>
      </div>

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-blue-50/50 via-white to-slate-50 pt-20 pb-20 lg:pt-28 lg:pb-24">
        {/* Background blobs */}
        <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-blue-400/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 text-left space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4.5 py-1.5 rounded-full shadow-sm">
                <BadgeCheck className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">AICTE & UGC Compliant Portal</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-slate-900">
                Bihar's Trusted UGC
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mt-2">
                  Internship Partner
                </span>
                for Colleges & Students
              </h1>

              <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
                InternMitra provides structured 120-hour industry internships and verified credentials. Access live video logs, learning material, placement mentorship, and UGC compliant certs.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/register">
                  <button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 cursor-pointer">
                    Start Registration
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>

                <a href="#verify">
                  <button className="bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 px-8 h-14 rounded-2xl font-black uppercase text-xs tracking-widest transition-all duration-300 shadow-sm flex items-center gap-2 cursor-pointer">
                    Verify Certificate
                  </button>
                </a>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                {[
                  { value: "20K+", label: "Trained Scholars" },
                  { value: "120 Hrs", label: "Structured Study" },
                  { value: "100%", label: "UGC Compliant" },
                  { value: "24/7", label: "Support Access" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/80 border border-slate-100 rounded-2xl p-4 shadow-sm text-center">
                    <h3 className="text-xl sm:text-2xl font-black text-blue-900">{stat.value}</h3>
                    <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right student mockup card grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl blur-2xl opacity-10" />
                <div className="bg-white p-4 rounded-3xl border border-slate-100 relative z-10 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop"
                    alt="Students collaborating"
                    className="rounded-2xl h-[300px] md:h-[380px] object-cover w-full shadow-inner"
                  />
                  {/* Floating badge cards */}
                  <div className="absolute -bottom-5 -left-5 bg-white p-3.5 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s' }}>
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                      <Award size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Certification</p>
                      <p className="text-xs font-black text-slate-900">UGC Compliant</p>
                    </div>
                  </div>

                  <div className="absolute -top-5 -right-5 bg-white p-3 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
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

      {/* STATS BANNER */}
      <section className="bg-[#0c1329] text-white py-14 border-y border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
            <div>
              <p className="text-4xl font-extrabold text-white">12,000+</p>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Active Enrollments</p>
            </div>
            <div className="pt-6 md:pt-0">
              <p className="text-4xl font-extrabold text-white">150+</p>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Associated Colleges</p>
            </div>
            <div className="pt-6 md:pt-0">
              <p className="text-4xl font-extrabold text-white">100%</p>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Digital Logs</p>
            </div>
            <div className="pt-6 md:pt-0">
              <p className="text-4xl font-extrabold text-white">98%</p>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Completion Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CERTIFICATE VERIFY */}
      <section id="verify" className="py-20 bg-slate-50 relative border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-150/60 rounded-3xl p-8 md:p-12 shadow-soft relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center space-y-5">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full shadow-sm">
                <SearchCheck className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-700">
                  Verify Credentials
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Download Verified <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Internship Certificate</span>
              </h2>

              <p className="text-slate-500 text-sm max-w-2xl mx-auto font-medium">
                Enter your certificate number below to instantly verify and download your official, UGC-compliant digital certificate.
              </p>

              <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 pt-3">
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
                  className="h-14 px-7 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-orange-500/10 active:scale-[0.98] cursor-pointer"
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
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 bg-blue-50 px-3 py-1 rounded-md inline-block">Dashboard Hub</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Powerful Features For <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Complete Management</span>
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
                className="bg-slate-50/50 hover:bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-[0_20px_50px_rgba(37,99,235,0.05)] hover:border-blue-100/50 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} border flex items-center justify-center text-2xl mb-6 shadow-sm`}>
                  {item.icon}
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-3 tracking-tight">
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
      <section className="py-24 bg-slate-50/80 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 bg-blue-50 px-3 py-1 rounded-md inline-block">Workflow</span>
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
                  desc: "Attend structured video hours, check resource materials, and submit reports."
                },
                {
                  title: "Earn Certificate",
                  desc: "Clear final quiz criteria to download your verified digital credentials."
                }
              ].map((item, index) => (
                <div key={index} className="text-center flex flex-col items-center group">
                  <div className="w-18 h-18 rounded-2xl bg-white border border-slate-200 shadow-sm text-blue-600 flex items-center justify-center text-xl font-black mb-5 relative group-hover:border-blue-400 transition-colors">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg px-2 py-0.5 text-[9px] font-black absolute -top-3 -right-3 shadow-md shadow-orange-500/10">0{index + 1}</span>
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
      {universities.length > 0 && (
        <section className="py-20 bg-white overflow-hidden border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 bg-blue-50 px-3 py-1 rounded-md inline-block">Coverage</span>
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
              {[...universities, ...universities].map((item, index) => (
                <div
                  key={index}
                  className="inline-block min-w-[260px] bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg text-blue-600 border border-blue-100/50 shadow-inner">
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
      )}

      {/* TESTIMONIALS */}
      <section className="py-24 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 bg-blue-50 px-3 py-1 rounded-md inline-block">Feedback</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Scholars & Faculty Reviews
            </h2>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed">
              Read real-world feedback from students and training heads who finished our modules.
            </p>
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex justify-center mb-12">
            <div className="bg-white shadow-sm rounded-2xl p-1 flex gap-1 border border-slate-100">
              {["All", "Students", "Teachers"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter === "Students" ? "Student" : filter === "Teachers" ? "Teacher" : "All")}
                  className={`px-6 py-2 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${(filter === "All" && activeFilter === "All") ||
                    (filter === "Students" && activeFilter === "Student") ||
                    (filter === "Teachers" && activeFilter === "Teacher")
                    ? "bg-slate-900 text-white shadow-sm"
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
                className="bg-white rounded-3xl p-8 border border-slate-150/60 shadow-soft hover:shadow-elegant transition-all duration-300 flex flex-col justify-between"
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
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-extrabold text-xs shadow-sm">
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

      {/* MILESTONES */}
      <section className="py-24 bg-slate-900 text-white relative">
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-md inline-block">Milestones</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Syllabus & Internship Path
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              Checklist of milestones from profile onboarding registration to certificate release.
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
                  <span className="text-[10px] text-blue-300 font-extrabold uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/25">
                    Step 0{index + 1}
                  </span>
                  <span className="bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-white mb-4 tracking-tight">
                  {step}
                </h3>

                <ul className="space-y-2 text-xs text-slate-400 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">✔</span> Industry aligned syllabus
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">✔</span> Realtime dashboard log
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500">✔</span> Certificate verification
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUPPORT */}
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
                  className="flex items-center justify-center gap-2.5 bg-white text-slate-800 px-5 h-11 rounded-lg font-black text-[11px] uppercase tracking-wider shadow-sm hover:bg-slate-50 transition cursor-pointer"
                >
                  <Mail size={14} className="text-blue-650" />
                  info@internmitra.com
                </a>
                <a
                  href="tel:+919693921517"
                  className="flex items-center justify-center gap-2.5 bg-white text-slate-800 px-5 h-11 rounded-lg font-black text-[11px] uppercase tracking-wider shadow-sm hover:bg-slate-50 transition cursor-pointer"
                >
                  <Phone size={14} className="text-blue-650" />
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

              {/* Dotted grid details */}
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
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/5 shadow-sm">
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
                  className="h-11 w-auto object-contain rounded-xl"
                />
                <div>
                  <h2 className="text-xl font-black tracking-tight">InternMitra</h2>
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Bihar's Internship Portal</p>
                </div>
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
            <p>© 2026 Internmitra. All rights reserved.</p>
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