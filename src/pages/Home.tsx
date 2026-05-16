import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
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

  const filteredTestimonials =
    activeFilter === "All"
      ? allTestimonials
      : allTestimonials.filter((item) => item.type === activeFilter);

  return (
    <div className="bg-white overflow-hidden">

      {/* HERO SECTION */}
      <section className="bg-[#071B4D] text-white pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >

            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-5 py-2 rounded-full mb-6">
              <BadgeCheck className="w-4 h-4" />
              UGC Compliant Internship Platform
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Empowering Students With
              <span className="text-cyan-400"> Industry Skills </span>
              & Internship Certification
            </h1>

            <p className="text-slate-300 text-lg leading-8 mb-8">
              Complete internship management platform for students and colleges.
              Learn with live sessions, projects, mentorship and certification.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 hover:scale-105 transition">
                  Register Now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>

              <Link to="/login">
                <button className="border border-white/20 px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 transition">
                  Login
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">

              <div className="bg-white/10 rounded-2xl p-5 text-center">
                <h2 className="text-2xl font-bold">10000+</h2>
                <p className="text-sm text-slate-300">Students</p>
              </div>

              <div className="bg-white/10 rounded-2xl p-5 text-center">
                <h2 className="text-2xl font-bold">120 Hrs</h2>
                <p className="text-sm text-slate-300">Training</p>
              </div>

              <div className="bg-white/10 rounded-2xl p-5 text-center">
                <h2 className="text-2xl font-bold">99%</h2>
                <p className="text-sm text-slate-300">Success</p>
              </div>

              <div className="bg-white/10 rounded-2xl p-5 text-center">
                <h2 className="text-2xl font-bold">24/7</h2>
                <p className="text-sm text-slate-300">Support</p>
              </div>

            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 rounded-[40px] shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop"
                alt=""
                className="rounded-3xl h-[500px] object-cover w-full"
              />
            </div>
          </motion.div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-slate-50">

        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-5">
              Powerful Features For
              <span className="text-purple-600"> Internship Management </span>
            </h2>

            <p className="text-slate-600 text-lg max-w-3xl mx-auto">
              End-to-end internship platform for colleges and students.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {features.map((item, index) => (
              <motion.div
                whileHover={{ y: -8 }}
                key={index}
                className="bg-white rounded-3xl border p-8 shadow-sm hover:shadow-xl transition"
              >

                <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center text-3xl mb-6">
                  {item.icon}
                </div>

                <h3 className="text-2xl font-bold mb-4">
                  {item.title}
                </h3>

                <p className="text-slate-600 leading-7">
                  {item.desc}
                </p>

              </motion.div>
            ))}

          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-slate-50">

        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center mb-14">

            <h2 className="text-5xl font-bold mb-5">
              What People Say About
              <span className="text-blue-600"> Internmitra </span>
            </h2>

            <p className="text-slate-600 text-lg">
              Trusted by students and teachers across India.
            </p>

          </div>

          {/* FILTER BUTTONS */}
          <div className="flex justify-center mb-14">

            <div className="bg-white shadow-lg rounded-full p-2 flex items-center gap-2 border border-slate-100">

              {["All", "Students", "Teachers"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter === "Students" ? "Student" : filter === "Teachers" ? "Teacher" : "All")}
                  className={`px-8 py-3 rounded-full font-semibold text-sm transition ${(filter === "All" && activeFilter === "All") ||
                    (filter === "Students" && activeFilter === "Student") ||
                    (filter === "Teachers" && activeFilter === "Teacher")
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  {filter}
                </button>
              ))}

            </div>

          </div>

          {/* TESTIMONIAL GRID */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {filteredTestimonials.map((item, index) => (

              <motion.div
                key={index}
                whileHover={{ y: -8 }}
                className="bg-white rounded-[30px] p-8 border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300"
              >

                {/* STARS */}
                <div className="flex gap-1 mb-5 text-yellow-400 text-xl">
                  ★★★★★
                </div>

                {/* REVIEW */}
                <p className="text-slate-600 leading-8 mb-8 text-lg">
                  "{item.review}"
                </p>

                {/* USER */}
                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-4">

                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {item.name.charAt(0)}
                    </div>

                    <div>

                      <h4 className="font-bold text-lg text-slate-900">
                        {item.name}
                      </h4>

                      <p className="text-slate-500">
                        {item.role}
                      </p>

                    </div>

                  </div>

                  <span className={`px-4 py-1 rounded-full text-xs font-semibold ${item.type === "Student"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
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
      <section className="py-24 bg-[#071B4D] text-white">

        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-5">
              From Registration To Certification
            </h2>

            <p className="text-slate-300 text-lg">
              Structured internship journey for every student.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {[
              "Quick Registration",
              "Payment & Enrollment",
              "Access Training",
              "Live Sessions",
              "Assessments",
              "Certificate Generation",
            ].map((step, index) => (

              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-3xl p-8"
              >

                <div className="flex justify-between items-center mb-5">
                  <span className="text-cyan-400 font-semibold">
                    STEP {index + 1}
                  </span>

                  <span className="bg-white/10 px-4 py-1 rounded-full text-sm">
                    ACTIVE
                  </span>
                </div>

                <h3 className="text-2xl font-bold mb-4">
                  {step}
                </h3>

                <ul className="space-y-3 text-slate-300">
                  <li>✔ Live Classes</li>
                  <li>✔ Study Materials</li>
                  <li>✔ Internship Tasks</li>
                  <li>✔ Certification</li>
                </ul>

              </div>

            ))}

          </div>
        </div>
      </section>

      {/* TECHNOLOGY */}
      <section className="py-24 bg-[#031131] text-white">

        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              Enterprise Grade Technology
            </h2>

            <p className="text-slate-300">
              Powerful infrastructure for large-scale internship management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {[
              {
                icon: <Users />,
                title: "500K+ Concurrent Users",
              },
              {
                icon: <Clock />,
                title: "Ultra Low Latency",
              },
              {
                icon: <Shield />,
                title: "Advanced Security",
              },
              {
                icon: <BookOpen />,
                title: "Real-time Learning",
              },
              {
                icon: <BarChart3 />,
                title: "Advanced Analytics",
              },
              {
                icon: <Shield />,
                title: "99.99% Uptime",
              },
            ].map((item, index) => (

              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-3xl p-8"
              >

                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
                  {item.icon}
                </div>

                <h3 className="text-2xl font-bold">
                  {item.title}
                </h3>

              </div>

            ))}

          </div>
        </div>
      </section>

      {/* SUPPORT */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">

        <div className="max-w-5xl mx-auto text-center px-4">

          <h2 className="text-5xl font-bold mb-4">
            24/7 Student Support
          </h2>

          <p className="text-lg text-blue-100 mb-10">
            Dedicated support team available anytime.
          </p>

          <div className="flex flex-wrap justify-center gap-8">

            <div className="flex items-center gap-3">
              <Mail />
              info@internmitra.com
            </div>

            <div className="flex items-center gap-3">
              <Phone />
              +91 9693921517
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#07142E] text-white pt-20 pb-10">

        <div className="max-w-7xl mx-auto px-4">

          <div className="grid lg:grid-cols-5 gap-10 mb-16">

            <div className="lg:col-span-2">

              <div className="flex items-center gap-3 mb-6">

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                  I
                </div>

                <div>
                  <h2 className="text-3xl font-bold">
                    Internmitra
                  </h2>

                  <p className="text-slate-400 text-sm">
                    Empowering Students
                  </p>
                </div>

              </div>

              <p className="text-slate-300 leading-8 mb-8">
                Internship platform helping students across India gain
                practical skills and certification.
              </p>

              <div className="flex gap-4 mb-8">

                {[Facebook, Instagram, Twitter, Linkedin, Youtube].map(
                  (Icon, index) => (

                    <div
                      key={index}
                      className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-blue-600 transition cursor-pointer"
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                  )
                )}

              </div>

              <div className="space-y-4 text-slate-300">

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-cyan-400" />
                  info@internmitra.com
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-cyan-400" />
                  +91 9693921517
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-cyan-400 mt-1" />
                  Patna,Bihar, India
                </div>

              </div>

            </div>

            <div>
              <h3 className="text-xl font-bold mb-6">
                Platform
              </h3>

              <ul className="space-y-4 text-slate-300">
                <li>
                  <Link
                    to="/features"
                    className="hover:text-white transition-colors duration-300"
                  >
                    Features
                  </Link>
                </li>
                <li>Pricing</li>
                <li>For Students</li>
                <li>For Colleges</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6">
                Support
              </h3>

              <ul className="space-y-4 text-slate-300">
                <li>FAQs</li>
                <li>
                  <Link
                    to="/about"
                    className="hover:text-white transition-colors duration-300"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-white transition-colors duration-300"
                  >
                    Contact us
                  </Link>
                </li>
                <li>Certificates</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6">
                Legal
              </h3>

              <ul className="space-y-4 text-slate-300">
                <li>Privacy Policy</li>
                <li>Terms & Conditions</li>
                <li>Refund Policy</li>
                <li>Cookie Policy</li>
              </ul>
            </div>

          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400">

            <p>
              © 2026 Internmitra. All rights reserved.
            </p>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              20,000+ Students
            </div>

          </div>

        </div>
      </footer>

    </div>
  );
}