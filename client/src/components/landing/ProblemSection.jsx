import React from 'react';
import TextReveal from './TextReveal';
import { 
  AlertOctagon, 
  FileWarning, 
  Target, 
  Layout, 
  TrendingDown,
  XCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';

export const ProblemSection = () => {
  const problems = [
    {
      icon: AlertOctagon,
      title: 'Poor ATS Compatibility',
      description: 'Tables, icons, columns, and graphics choke automated applicant filters, silently disqualifying 75% of applicants.',
      stat: '75% filtered out',
    },
    {
      icon: FileWarning,
      title: 'Weak Bullet Points',
      description: 'Listing generic daily duties instead of punchy, proactive responsibility blocks that prove seniority and execution.',
      stat: 'Vague descriptions',
    },
    {
      icon: Target,
      title: 'Missing Keywords',
      description: 'Failing to include the precise technical phrases and required competencies searched by corporate recruiting algorithms.',
      stat: 'Keyword mismatch',
    },
    {
      icon: Layout,
      title: 'Bad Formatting',
      description: 'Inconsistent typography, broken spacing, and awkward margins that tire recruiter eyes in the 6-second first glance.',
      stat: '6-second scan lost',
    },
    {
      icon: TrendingDown,
      title: 'No Measurable Achievements',
      description: 'Zero revenue, latency, conversion, or efficiency metrics ($ / % / X) leaving recruiters doubting your actual impact.',
      stat: 'Zero quantified data',
    },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-[#050811] overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header with SplitType Character Reveal */}
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-16 md:mb-20">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <XCircle className="w-3.5 h-3.5" />
            <span>The Hidden Barrier</span>
          </div>

          {/* GSAP SplitType Scrub Reveal */}
          <TextReveal
            as="h2"
            start="top 85%"
            end="bottom 50%"
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight"
          >
            Your resume shouldn't be the reason you miss the interview.
          </TextReveal>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Most qualified candidates get rejected not because of their skills, but because their resume fails to communicate value to modern hiring software.
          </p>
        </div>

        {/* 5 Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {problems.map((problem, i) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`p-6 sm:p-7 rounded-2xl bg-[#0b101d] border border-slate-800/90 hover:border-rose-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-rose-500/5 ${
                  i === 4 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-rose-400/90 bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-800/40">
                    {problem.stat}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-rose-300 transition-colors">
                  {problem.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {problem.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
