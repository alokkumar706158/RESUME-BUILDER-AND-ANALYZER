import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Target, 
  ListPlus, 
  Key, 
  Gauge, 
  LayoutTemplate, 
  Wand2 
} from 'lucide-react';
import { motion } from 'framer-motion';

export const FeaturesSection = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'AI Resume Writing',
      description: 'Generates polished, persuasive professional summaries and work history blocks tailored to your exact industry.',
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      icon: ShieldCheck,
      title: 'ATS Optimization',
      description: 'Formats and structures headings, margins, and bullet structures to pass 99% of corporate scanner checks.',
      gradient: 'from-emerald-400 to-teal-500',
    },
    {
      icon: Target,
      title: 'Job Description Matching',
      description: 'Paste any job posting URL or text to instantly extract missing skills and tailor your experience precisely.',
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      icon: ListPlus,
      title: 'AI Bullet Point Generator',
      description: 'Transforms weak, passive job descriptions into action-driven statements with measurable metric placeholders.',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: Key,
      title: 'Smart Keyword Suggestions',
      description: 'Scans industry database for trending competencies and keywords recruiters search for in your role.',
      gradient: 'from-amber-400 to-orange-500',
    },
    {
      icon: Gauge,
      title: 'Real-Time Resume Score',
      description: 'Instant 0-100 diagnostic score assessing brevity, style, impact metrics, and syntax clarity.',
      gradient: 'from-cyan-400 to-blue-600',
    },
    {
      icon: LayoutTemplate,
      title: 'Multiple ATS Templates',
      description: 'Switch between minimal, executive, modern, and classic layouts with zero re-typing or formatting breaks.',
      gradient: 'from-indigo-500 to-brandPurple',
    },
    {
      icon: Wand2,
      title: 'One-Click AI Improvements',
      description: 'Click "Fix it for me" on any section to auto-correct typos, upgrade verbs, and trim unnecessary fluff.',
      gradient: 'from-teal-400 to-emerald-500',
    },
  ];

  return (
    <section id="features" className="relative py-24 md:py-32 bg-[#070b16] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brandPurple/10 border border-brandPurple/30 text-brandPurple text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powerhouse Capabilities</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Engineered to Beat the <span className="bg-clip-text text-transparent bg-gradient-to-r from-brandPurple to-cyan-400">Competition</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Every feature is purpose-built to help you craft an elite, recruiter-ready resume in minutes instead of hours.
          </p>
        </div>

        {/* 8 Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group relative p-6 sm:p-7 rounded-2xl bg-[#0e1628]/70 border border-slate-800/90 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brandPurple/10 flex flex-col justify-between"
              >
                {/* Hover gradient glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brandPurple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-brandPurple transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center text-[11px] font-semibold text-slate-500 group-hover:text-slate-300 transition-colors">
                  <span>Included with free account</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
