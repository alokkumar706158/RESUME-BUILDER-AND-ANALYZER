import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Star,
  Bot
} from 'lucide-react';
import { motion } from 'framer-motion';

export const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section id="hero" className="relative min-h-screen pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#070b16]">
      {/* Ambient Radial Lights & Grid Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-brandPurple/25 via-indigo-600/15 to-brandBlue/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Subtle Matrix Dot Grid */}
      <div 
        className="absolute inset-0 opacity-[0.14] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Top Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-inner backdrop-blur-md"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Next-Gen AI Resume Engine 3.0
              </span>
              <span className="text-xs font-bold text-brandPurple bg-brandPurple/10 px-2 py-0.5 rounded-full border border-brandPurple/30">
                New
              </span>
            </motion.div>

            {/* Main Hero Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]"
            >
              Build a Resume That{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brandPurple via-indigo-300 to-cyan-400">
                Gets Noticed.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-300/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              AI-powered resume building, ATS optimization and intelligent suggestions — everything you need to turn your experience into a job-winning resume.
            </motion.p>

            {/* CTA Buttons Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link
                to={user ? "/builder" : "/signup"}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-brandPurple via-indigo-600 to-brandBlue hover:opacity-95 shadow-xl shadow-brandPurple/30 hover:shadow-brandPurple/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <span>Build My Resume</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to={user ? "/dashboard" : "/signup"}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-7 py-4 rounded-xl text-base font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 shadow-md backdrop-blur-md transition-all hover:scale-[1.01]"
              >
                <Zap className="w-5 h-5 text-amber-400" />
                <span>Analyze My Resume</span>
              </Link>
            </motion.div>

            {/* Trust Micro-Bullets */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm text-slate-400 font-medium"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Free to Start</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>99.4% ATS Compatibility</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Visual AI Resume Mockup Card */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mx-auto max-w-lg lg:max-w-none"
            >
              {/* Outer Glowing Border Frame */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-brandPurple via-cyan-500 to-indigo-600 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition duration-1000"></div>

              {/* Main Card */}
              <div className="relative rounded-2xl bg-[#0e1628]/90 border border-slate-700/70 shadow-2xl backdrop-blur-xl p-5 sm:p-6 overflow-hidden">
                {/* Header of Mockup */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brandPurple to-brandBlue flex items-center justify-center text-white font-bold text-sm shadow-md">
                      JD
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm sm:text-base leading-tight">Jordan Doe</h4>
                      <p className="text-slate-400 text-xs">Senior Full-Stack & AI Engineer</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400">96 / 100 ATS</span>
                  </div>
                </div>

                {/* AI Improvement Pill Alert */}
                <div className="p-3 mb-4 rounded-xl bg-brandPurple/10 border border-brandPurple/30 flex items-start space-x-3">
                  <Bot className="w-5 h-5 text-brandPurple flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-white">AI Suggestion Applied</p>
                    <p className="text-slate-300">
                      Replaced passive verbs with <span className="text-cyan-400 font-bold">"Architected & Scaled"</span> — improved recruiter impact by <span className="text-emerald-400 font-bold">+38%</span>.
                    </p>
                  </div>
                </div>

                {/* Mock Resume Content Blocks */}
                <div className="space-y-3.5 text-left">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Professional Summary
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      High-impact engineer with 5+ years scaling distributed cloud applications and generative AI models across AWS and Kubernetes.
                    </p>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Key Skills Match</span>
                      <span className="text-cyan-400 font-semibold text-[10px]">100% Target Met</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['React 19', 'Next.js', 'Node.js', 'Python', 'PostgreSQL', 'LangChain', 'Docker'].map((skill) => (
                        <span key={skill} className="px-2 py-0.5 text-[11px] font-medium bg-slate-800 text-slate-200 rounded-md border border-slate-700/60 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Quick Score Breakdown Bar */}
                <div className="mt-4 pt-3.5 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-900/80">
                    <div className="text-[10px] text-slate-400 uppercase">Impact</div>
                    <div className="text-sm font-extrabold text-emerald-400">98%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/80">
                    <div className="text-[10px] text-slate-400 uppercase">Keywords</div>
                    <div className="text-sm font-extrabold text-cyan-400">95%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/80">
                    <div className="text-[10px] text-slate-400 uppercase">Format</div>
                    <div className="text-sm font-extrabold text-brandPurple">100%</div>
                  </div>
                </div>
              </div>

              {/* Floating Badge Left */}
              <motion.div
                animate={{ y: [-4, 6, -4] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="hidden sm:flex absolute -left-6 bottom-16 bg-[#131b2e]/95 border border-slate-700 p-3 rounded-xl shadow-xl items-center space-x-3 backdrop-blur-md"
              >
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">+4.2x Callbacks</div>
                  <div className="text-[10px] text-slate-400">Verified User Stat</div>
                </div>
              </motion.div>

              {/* Floating Badge Right */}
              <motion.div
                animate={{ y: [6, -4, 6] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                className="hidden sm:flex absolute -right-6 top-8 bg-[#131b2e]/95 border border-slate-700 p-3 rounded-xl shadow-xl items-center space-x-3 backdrop-blur-md"
              >
                <div className="p-2 rounded-lg bg-brandPurple/20 text-brandPurple">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">AI Content Tailored</div>
                  <div className="text-[10px] text-slate-400">Optimized for ATS Filters</div>
                </div>
              </motion.div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
