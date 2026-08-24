import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Flame, 
  Sparkles, 
  Terminal, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  FileCheck, 
  RefreshCcw, 
  ChevronDown, 
  Star 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-800 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left text-slate-200 hover:text-white transition-colors"
      >
        <span className="font-semibold text-base md:text-lg">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brandPurple' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-slate-400 text-sm md:text-base mt-2.5 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Landing = () => {
  const { user } = useAuth();

  const faqs = [
    {
      question: "What is an ATS and why does it matter?",
      answer: "An Applicant Tracking System (ATS) is software used by employers to filter resumes based on keywords, formatting, and layout relevancy. If your resume does not match the target job description or contains complex designs, it could be auto-rejected before reaching a human."
    },
    {
      question: "How does the 'Fix it for me' feature work?",
      answer: "Our application integrates Google Gemini AI to analyze your current section texts. When you click 'Fix it for me', the AI rewrites that specific section professionally, optimizing key phrases, action verbs, and structure while preserving your actual facts."
    },
    {
      question: "Will my resume stay clean and ATS-friendly?",
      answer: "Yes. The generated PDFs are compiled using strict single-column guidelines, standard fonts, and neat section divisions, which guarantees that recruiters and software engines can read it perfectly."
    },
    {
      question: "Is my personal data secure?",
      answer: "Absolutely. We encrypt all passwords using bcrypt hashing and protect backend sessions using JWT tokens stored securely. We do not store raw PDF files permanently, only parsing the content buffer in memory during analysis."
    }
  ];

  const features = [
    {
      title: "Honest AI Roasts",
      description: "Receive a humorous yet highly constructive critique of your formatting, phrasing, and missing details.",
      icon: Flame,
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    },
    {
      title: "ATS Score Analysis",
      description: "Evaluate your score against exact target positions (0-100) using custom visual circular gauges.",
      icon: FileCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Keyword Discovery",
      description: "Extract vital keywords and tools from standard job templates and see how and where to inject them.",
      icon: Terminal,
      color: "text-brandBlue",
      bg: "bg-brandBlue/10"
    },
    {
      title: "One-Click Rewrites",
      description: "Click 'Fix it for me' and let Gemini optimize specific bullets using structured STAR formats.",
      icon: RefreshCcw,
      color: "text-brandPurple",
      bg: "bg-brandPurple/10"
    }
  ];

  return (
    <div className="bg-darkBg min-h-screen text-slate-100 relative">
      {/* Decorative Blob */}
      <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] bg-brandPurple/10 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />
      <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] bg-brandBlue/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />

      {/* Header / Top Nav */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Flame className="w-7 h-7 text-brandPurple" />
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brandPurple to-brandBlue">
            ResumeRoast AI
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <Link 
              to="/dashboard" 
              className="px-4 py-2 bg-gradient-to-r from-brandPurple to-brandBlue hover:opacity-95 text-white text-sm font-semibold rounded-lg shadow-md transition-all flex items-center space-x-1"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="px-4.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white text-sm font-semibold rounded-lg transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-brandPurple mb-4">
            <Sparkles className="w-4 h-4 text-brandPurple animate-spin" />
            <span>Power by Google Gemini 1.5 Flash</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto text-white">
            Your Resume <br className="hidden md:block" />
            <span className="text-gradient">Deserves Better.</span>
          </h1>

          <p className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
            Get instant ATS score evaluations, keyword recommendations, a constructive roast, and professional AI-assisted resume rewrites.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? "/dashboard" : "/login"}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-brandPurple to-brandBlue hover:opacity-95 text-white font-semibold rounded-xl shadow-lg shadow-brandPurple/20 transition-all flex items-center justify-center space-x-2 group"
            >
              <span>Analyze Resume</span>
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl transition-all flex items-center justify-center"
            >
              View Features
            </a>
          </div>
        </motion.div>

        {/* Hero Interactive UI Card Mockup */}
        <motion.div 
          className="mt-16 max-w-4xl mx-auto glass-panel border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-4 mb-6">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-slate-500 tracking-wider ml-4">resumeroast_dashboard.dmg</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center space-y-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ATS MATCH RATE</span>
              <span className="text-5xl font-extrabold text-emerald-500">89%</span>
              <span className="text-xs text-slate-400">Excellent job alignment</span>
            </div>
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800/50 md:col-span-2 space-y-2.5">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>AI Honest Roast</span>
              </span>
              <p className="text-sm italic text-slate-300 leading-relaxed">
                "This resume looks like it skipped leg day. You mention you 'collaborated on tasks' but forgot to list what you actually built. Let's add some metrics."
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Everything you need to land interviews
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Our AI analysis reviews details that humans skip, giving you the edge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col space-y-4"
              >
                <div className={`p-3.5 rounded-xl ${feature.bg} ${feature.color} w-fit`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-white">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Loved by Students and Engineers
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Hear from students who optimized their profiles and landed roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Sarah Jenkins",
              role: "Junior Full Stack Engineer",
              company: "Stripe",
              quote: "The Roast was brutal but totally correct. Once I fixed the metrics in my projects and ran it again, my interview call rates tripled.",
              stars: 5
            },
            {
              name: "Rajesh Kumar",
              role: "Backend Intern",
              company: "Amazon",
              quote: "Uploading my resume PDF and choosing Java Developer parsed everything automatically. The 'Fix it for me' button rewrote my summary beautifully.",
              stars: 5
            },
            {
              name: "David Chen",
              role: "CS Graduate",
              company: "Vercel",
              quote: "I was getting auto-rejected by ATS parsers. ResumeRoast highlighted exactly which keywords were missing. Lifesaver!",
              stars: 5
            }
          ].map((test, index) => (
            <div key={index} className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center space-x-1 text-amber-500">
                {[...Array(test.stars)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-slate-300 text-sm italic leading-relaxed">"{test.quote}"</p>
              <div>
                <h4 className="font-bold text-sm text-white">{test.name}</h4>
                <p className="text-slate-500 text-xs">{test.role} @ {test.company}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-900">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 px-6 bg-slate-950/40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <Flame className="w-6 h-6 text-brandPurple" />
            <span className="font-bold text-lg text-white">ResumeRoast AI</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} ResumeRoast AI. All rights reserved.
          </p>
          <div className="flex space-x-4 text-slate-500 text-sm">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
