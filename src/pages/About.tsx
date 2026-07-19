import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Handshake, Target, Users, Award, ShieldCheck, Zap, Eye, Gem, Check,
  Mail, Phone, X, ArrowRight, ClipboardCheck, UserCheck, Briefcase, FileText,
  GraduationCap, Building2, Layers, Clock, TrendingUp, HelpCircle,
  Facebook, Instagram, Twitter, Linkedin, Youtube
} from 'lucide-react';

export default function About() {
  const [activePolicy, setActivePolicy] = useState<'privacy' | 'terms' | null>(null);

  const privacyPolicyContent = {
    title: "Privacy Policy",
    lastUpdated: "July 19, 2026",
    sections: [
      {
        title: "1. Information We Collect",
        content: "We collect information you provide directly to us when registering for an internship, such as your name, email address, phone number, college name, university registration number, and selected internship domain. We also automatically collect log data, device details, browser type, and access times to ensure a secure session."
      },
      {
        title: "2. How We Use Your Information",
        content: "Your data is used to administer your internship programs, generate UGC-compliant certificates, track attendance, log your activities, and communicate support updates. We do not sell or trade your personal information to third parties."
      },
      {
        title: "3. Data Security",
        content: "We implement industry-standard security measures, including Firebase SSL encryption and secure firestore rules, to safeguard your database records. However, no internet transmission is 100% secure, and we urge you to keep your login credentials confidential."
      },
      {
        title: "4. Third-Party Services",
        content: "We may integrate with third-party service providers (such as Razorpay for secure payment processing). These providers access your information only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose."
      },
      {
        title: "5. Your Rights",
        content: "You have the right to access, update, or request the deletion of your personal information stored on InternMitra. You can update your profile details in your dashboard or contact our support team at info@internmitra.com for database assistance."
      }
    ]
  };

  const termsConditionsContent = {
    title: "Terms & Conditions",
    lastUpdated: "July 19, 2526",
    sections: [
      {
        title: "1. Enrollment & Verification",
        content: "By registering on InternMitra, you confirm that you are a student enrolled in an academic program and that the information provided (such as college name and registration ID) is accurate. Access is granted strictly to the registered individual."
      },
      {
        title: "2. Internship Requirements & Attendance",
        content: "To qualify for the final UGC-compliant certificate, scholars must complete the designated 120-hour internship syllabus, submit all project logs, and maintain active participation. Certificates are only issued upon successful completion and verification of coursework."
      },
      {
        title: "3. Academic Integrity",
        content: "All assignments, code implementations, and project reports submitted by you must be your own original work. Plagiarism or sharing answers with other candidates may result in immediate suspension from the program without certification."
      },
      {
        title: "4. Intellectual Property",
        content: "The lectures, course contents, project definitions, and templates provided on the platform remain the intellectual property of InternMitra and its partner institutions. Unauthorized distribution of study material is strictly prohibited."
      },
      {
        title: "5. Termination",
        content: "We reserve the right to suspend or terminate your account access if you violate these terms, engage in abusive behavior towards mentors or fellow students, or compromise the platform's security."
      }
    ]
  };

  const selectedContent = activePolicy === 'privacy' ? privacyPolicyContent : termsConditionsContent;

  return (
    <div className="bg-[#f8fafc] overflow-hidden select-none font-sans text-left">
      {/* SECTION 1: ABOUT INTERNMITRA */}
      <section className="py-12 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] bg-blue-50 px-3 py-1.5 rounded-full inline-block">
              About InternMitra
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Bridging the Gap Between <br className="hidden sm:inline" />
              <span className="text-blue-600">Education</span> and <span className="text-blue-600">Industry</span>
            </h1>
            <p className="text-slate-500 font-semibold text-sm sm:text-base leading-relaxed">
              InternMitra is a professional training ecosystem dedicated to empowering scholars with certified internship experiences and industry-approved skills.
            </p>
            <p className="text-slate-500 font-semibold text-sm sm:text-base leading-relaxed">
              We collaborate with top colleges, mentors and organizations to deliver structured, 120-hour internship programs that provide real-world exposure, verified credentials, and career-ready skills to students across India.
            </p>

            {/* Badges row */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: 'UGC Compliant', label: 'Programs', icon: ShieldCheck },
                { title: 'Industry Verified', label: 'Certificates', icon: Award },
                { title: 'Practical Learning', label: 'Approach', icon: Zap }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/50">
                    <item.icon size={16} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-800 leading-tight uppercase tracking-tight">{item.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image/Graphic Column */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Dotted decorative grid in the background */}
            <div className="absolute -top-6 -right-6 w-36 h-36 opacity-30 pointer-events-none z-0"
              style={{
                backgroundImage: 'radial-gradient(#2563eb 2px, transparent 2px)',
                backgroundSize: '16px 16px'
              }}
            />
            <div className="absolute -bottom-6 -left-6 w-36 h-36 opacity-30 pointer-events-none z-0"
              style={{
                backgroundImage: 'radial-gradient(#2563eb 2px, transparent 2px)',
                backgroundSize: '16px 16px'
              }}
            />

            {/* Collage Image Container */}
            <div className="relative z-10 w-full max-w-[420px] rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-150 bg-white">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800"
                alt="Students collaborating"
                className="w-full h-[320px] sm:h-[400px] object-cover hover:scale-103 transition-transform duration-500"
              />
            </div>

            {/* Overlay badge 1: MSME Certified */}
            <div className="absolute top-8 -right-4 z-20 bg-white/95 backdrop-blur-sm border border-slate-100 rounded-2xl shadow-lg p-3.5 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center border border-green-150">
                <Check size={14} className="stroke-[3]" />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-black text-slate-800 tracking-wide block uppercase leading-none">MSME CERTIFIED</span>
              </div>
            </div>

            {/* Overlay badge 2: UGC Compliant */}
            <div className="absolute -bottom-4 -left-4 z-20 bg-white/95 backdrop-blur-sm border border-slate-100 rounded-2xl shadow-lg p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-150">
                <ShieldCheck size={18} />
              </div>
              <div className="text-left">
                <span className="text-[8px] font-bold text-slate-400 block uppercase tracking-wider leading-none">CERTIFICATION</span>
                <span className="text-[10px] font-black text-slate-800 tracking-wide block uppercase mt-0.5">UGC Compliant</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: OUR CORE MISSION */}
      <section className="py-16 md:py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">

          <div className="max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.25em] bg-blue-50 px-3 py-1.5 rounded-full inline-block">
              Our Core Mission
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Equipping Scholars for Success
            </h2>
            <p className="text-slate-500 leading-relaxed font-semibold text-sm sm:text-base">
              Our mission is to democratize high-quality industrial training by providing structured, certified 120-hour internship programs across 17+ high-growth domains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Card 1: Our Mission */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col text-left space-y-4 hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/50 flex items-center justify-center shadow-sm">
                <Target size={22} />
              </div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Our Mission</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                To bridge the gap between academic learning and industry requirements through practical training and mentorship.
              </p>
            </div>

            {/* Card 2: Our Vision */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col text-left space-y-4 hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 border border-green-100/50 flex items-center justify-center shadow-sm">
                <Eye size={22} />
              </div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Our Vision</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                To become India's most trusted platform for internship-based learning and skill development.
              </p>
            </div>

            {/* Card 3: Our Values */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col text-left space-y-4 hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100/50 flex items-center justify-center shadow-sm">
                <Gem size={22} />
              </div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Our Values</h3>
              <ul className="space-y-2">
                {['Quality Learning', 'Integrity & Transparency', 'Student First Approach', 'Continuous Improvement'].map((val, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                    <Check size={12} className="text-purple-600 stroke-[3]" />
                    {val}
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 4: Our Commitment */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col text-left space-y-4 hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100/50 flex items-center justify-center shadow-sm">
                <Users size={22} />
              </div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Our Commitment</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                We are committed to student growth, career success, and building a future-ready workforce.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 3: STATS BAR */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-white/5 relative overflow-hidden">
          {/* Decorative design blob */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center relative z-10">
            {[
              { stat: '20K+', label: 'Trained Scholars', icon: Users },
              { stat: '150+', label: 'Partner Institutions', icon: GraduationCap },
              { stat: '17+', label: 'Industry Domains', icon: Layers },
              { stat: '120 Hrs', label: 'Structured Internship', icon: Clock },
              { stat: '98%', label: 'Completion Rate', icon: TrendingUp }
            ].map((statItem, idx) => (
              <div key={idx} className="space-y-2 flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-blue-200 border border-white/10 mb-1">
                  <statItem.icon size={16} />
                </div>
                <h4 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-none">
                  {statItem.stat}
                </h4>
                <p className="text-[10px] md:text-xs text-slate-300 font-bold uppercase tracking-wider">
                  {statItem.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: WHY CHOOSE INTERNMITRA */}
      <section className="py-16 md:py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">

          <div className="max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.25em] bg-blue-50 px-3 py-1.5 rounded-full inline-block">
              Why Choose InternMitra?
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              The Right Platform for Your Career Journey
            </h2>
            <p className="text-slate-500 leading-relaxed font-semibold text-sm sm:text-base">
              We provide everything a student needs to gain practical exposure, build skills and get certified – all in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

            {/* Card 1 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4 hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/50 flex items-center justify-center shadow-sm">
                <Award size={22} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Industry-Aligned Internships</h3>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Curriculum designed with industry experts to ensure job-ready skills.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4 hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 border border-green-100/50 flex items-center justify-center shadow-sm">
                <ClipboardCheck size={22} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Real-World Experience</h3>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Work on live projects and case studies to build practical knowledge.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4 hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100/50 flex items-center justify-center shadow-sm">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Verified Certification</h3>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                UGC-compliant digital certificates to validate your skills.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4 hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100/50 flex items-center justify-center shadow-sm">
                <UserCheck size={22} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Expert Mentorship</h3>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Learn from experienced mentors and industry professionals.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4 hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100/50 flex items-center justify-center shadow-sm">
                <Briefcase size={22} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Career Support</h3>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Get guidance on resume, interview prep and placement opportunities.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 5: POLICIES */}
      <section className="py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.25em] bg-blue-50 px-3 py-1.5 rounded-full inline-block">
            Policies
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Privacy Policy & Guidelines
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed font-semibold text-sm sm:text-base">
            We are committed to protecting your privacy and ensuring a safe, transparent and trustworthy experience on InternMitra.
          </p>
        </div>

        {/* Rows of Policies (Privacy and Terms & Conditions) */}
        <div className="space-y-4">

          {/* Privacy Policy */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-blue-200 transition-colors duration-300">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div className="space-y-1 text-left">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Privacy Policy</h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-2xl">
                  We respect your privacy and ensure that your personal information is protected. Your data is used only to improve your experience and is never shared with third parties.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActivePolicy('privacy')}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold px-4 text-xs tracking-tight transition active:scale-95 cursor-pointer shrink-0"
            >
              Read Full Policy <ArrowRight size={13} />
            </button>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-green-200 transition-colors duration-300">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 border border-green-100 flex items-center justify-center shrink-0">
                <FileText size={22} />
              </div>
              <div className="space-y-1 text-left">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Terms & Conditions</h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-2xl">
                  By using InternMitra, you agree to our terms and conditions. Please read them carefully to understand your rights and responsibilities.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActivePolicy('terms')}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold px-4 text-xs tracking-tight transition active:scale-95 cursor-pointer shrink-0"
            >
              Read Full Policy <ArrowRight size={13} />
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 6: HAVE QUESTIONS? WE'RE HERE TO HELP! */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 shadow-lg relative overflow-hidden select-none">

          <div className="space-y-4 z-10 flex-1 text-left">
            <h2 className="text-3xl font-black tracking-tight text-white leading-none">
              Have Questions? We're Here to Help!
            </h2>
            <p className="text-xs text-indigo-100 max-w-md leading-relaxed">
              Our support team and expert trainers are available 24/7 to assist you on your learning journey.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="mailto:info@internmitra.com"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold px-5 text-xs transition active:scale-95 cursor-pointer"
              >
                <Mail size={14} />
                info@internmitra.com
              </a>
              <a
                href="tel:+919693921517"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 text-blue-600 font-black px-5 text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                <Phone size={14} />
                +91 9693921517
              </a>
            </div>
          </div>

          {/* Support Graphic Illustration */}
          <div className="z-10 flex-shrink-0 flex justify-center">
            <img
              src="/support_illustration.png"
              alt="Support Agent Illustration"
              className="h-32 md:h-44 w-auto object-contain drop-shadow-md"
            />
          </div>

          {/* Decorative background blob */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* POLICY DETAILS MODAL */}
      <AnimatePresence>
        {activePolicy && selectedContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePolicy(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative z-10 bg-white w-full max-w-3xl max-h-[85vh] rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden text-left"
            >
              {/* Modal Header */}
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="space-y-1 text-left">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
                    {selectedContent.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                    Last Updated: {selectedContent.lastUpdated}
                  </span>
                </div>
                <button
                  onClick={() => setActivePolicy(null)}
                  className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 flex items-center justify-center transition active:scale-90 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-left">
                {selectedContent.sections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-wider">
                      {section.title}
                    </h4>
                    <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50">
                <button
                  onClick={() => setActivePolicy(null)}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 text-xs transition active:scale-95 cursor-pointer shadow-md shadow-blue-600/10"
                >
                  Understood & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="bg-[#0b0e1a] text-white pt-20 pb-10 border-t border-slate-900 select-none text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 mb-16">

            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-600/10">
                  IM
                </div>
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
                <li onClick={() => setActivePolicy('privacy')} className="hover:text-blue-400 cursor-pointer transition-colors">Privacy Policy</li>
                <li onClick={() => setActivePolicy('terms')} className="hover:text-blue-400 cursor-pointer transition-colors">Terms & Conditions</li>
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
