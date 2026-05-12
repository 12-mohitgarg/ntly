import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { ArrowRight, BookOpen, Clock, Award, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const stats = [
    { label: 'Active Students', value: '50,000+', icon: Users },
    { label: 'Daily Training', value: '4 Hours', icon: Clock },
    { label: 'Success Rate', value: '98%', icon: Award },
    { label: 'Partner Companies', value: '500+', icon: BookOpen },
  ];

  return (
    <div className="overflow-hidden bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 bg-white border-b border-slate-100" id="hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-500/20 mb-8">
                Revolutionizing Education in India
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.05] mb-8">
                Empowering <span className="text-blue-600 relative">Students<span className="absolute bottom-1 left-0 w-full h-3 bg-blue-100 -z-10"></span></span> with Industry Skills.
              </h1>
              <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-lg font-medium italic">
                Join InternMitra for specialized 120-hour internship programs. Get UGC-compliant certificates, live mentorship, and real-world project experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="h-16 px-10 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-600/20 w-full sm:w-auto font-bold">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/features">
                  <Button size="lg" variant="outline" className="h-16 px-10 text-lg border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl w-full sm:w-auto font-bold">
                    Explore Features
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mt-16 lg:mt-0 relative"
            >
              <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-8 border-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" 
                  alt="Students learning together"
                  className="w-full h-[550px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10 text-white">
                  <p className="text-lg font-medium italic">"InternMitra changed my career path. The 120 hours of training were intense but incredibly rewarding."</p>
                  <p className="mt-4 text-blue-400 font-bold uppercase tracking-widest text-sm">— Rahul K., Web Dev Intern</p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-700" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-[32px] bg-white/5 border border-white/10 text-center group hover:bg-white/10 transition-colors"
              >
                <div className="inline-flex p-4 rounded-2xl bg-blue-600/20 text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                  <stat.icon size={28} />
                </div>
                <div className="text-4xl font-black text-white mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-xs text-slate-400 uppercase tracking-[0.2em] font-bold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 left-1/2 w-full h-full bg-blue-600/5 blur-[120px] rounded-full -translate-x-1/2" />
      </section>

      {/* Categories / Subjects Teaser */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">Specialized Subject Tracks</h2>
              <p className="text-xl text-slate-500 font-medium italic">Choose from over 17 distinct domains curated by industry experts representing over 500+ global partner companies.</p>
            </div>
            <Link to="/features" className="group flex items-center text-blue-600 font-bold bg-white px-8 py-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all">
              View all 17 Subjects <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Web Development', icon: '🌐', color: 'bg-blue-50', text: 'Master modern MERN stack with live projects and mentorship.' },
              { title: 'Cyber Security', icon: '🛡️', color: 'bg-red-50', text: 'Learn ethical hacking, threat detection, and digital defense.' },
              { title: 'Financial Literacy', icon: '📈', color: 'bg-green-50', text: 'Understand stock markets, taxation, and wealth management.' }
            ].map((subject, i) => (
              <motion.div
                key={subject.title}
                whileHover={{ y: -12 }}
                className="p-10 rounded-[32px] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500 relative group"
              >
                <div className={`text-4xl mb-8 inline-block p-5 ${subject.color} rounded-2xl group-hover:scale-110 transition-transform`}>{subject.icon}</div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">{subject.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-8 italic">{subject.text}</p>
                <div className="h-1.5 w-16 bg-blue-600 rounded-full group-hover:w-full transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>

  );
}
