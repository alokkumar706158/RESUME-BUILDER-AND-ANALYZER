import React, { useState } from 'react';
import { XCircle, CheckCircle2, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export const BeforeAfterSection = () => {
  const [selectedRole, setSelectedRole] = useState('swe');

  const examples = {
    swe: {
      role: 'Full-Stack Developer',
      before: {
        score: '54/100 ATS',
        bullets: [
          'Responsible for working on front-end features in React.',
          'Helped fix bugs and improve website loading speed.',
          'Assisted the senior team members with database queries.',
        ],
        drawbacks: ['Passive language', 'No measurable impact', 'Missing keywords (TypeScript, Next.js, Redux)'],
      },
      after: {
        score: '96/100 ATS',
        bullets: [
          'Architected responsive frontend modules in Next.js & TypeScript, accelerating user engagement by 34%.',
          'Optimized Webpack bundles and code-splitting, trimming page load latency from 2.8s to 820ms.',
          'Refactored legacy PostgreSQL queries and indexes, decreasing cloud server compute load by 28%.',
        ],
        improvements: ['High-impact action verbs', 'Quantified results ($ & %)', '100% matched keywords'],
      }
    },
    product: {
      role: 'Product Manager',
      before: {
        score: '58/100 ATS',
        bullets: [
          'Wrote user stories and tickets in Jira.',
          'Organized weekly sprint meetings for the engineers.',
          'Conducted user interviews to collect feedback.',
        ],
        drawbacks: ['Task-based list', 'Zero business metrics', 'Lacks leadership presence'],
      },
      after: {
        score: '98/100 ATS',
        bullets: [
          'Spearheaded product discovery across 45 B2B clients, unlocking a new enterprise revenue line of $620K ARR.',
          'Prioritized roadmap backlog using RICE framework, reducing engineering sprint cycle time by 22%.',
          'Launched self-serve checkout funnel boosting conversion by 4.2x within 60 days of launch.',
        ],
        improvements: ['Quantified ARR & velocity', 'Framework-backed strategy', 'Clear executive presence'],
      }
    }
  };

  const current = examples[selectedRole];

  return (
    <section id="comparison" className="relative py-24 md:py-32 bg-[#070b16] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Transformation</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Before AI vs. <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-brandPurple">After AI</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            See how subtle phrasing and precision metrics turn an overlooked application into an interview guarantee.
          </p>

          {/* Role Toggle Switcher */}
          <div className="pt-4 flex justify-center">
            <div className="bg-slate-900 p-1.5 rounded-xl border border-slate-800 inline-flex space-x-1.5">
              <button
                onClick={() => setSelectedRole('swe')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedRole === 'swe'
                    ? 'bg-brandPurple text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Software Engineer
              </button>
              <button
                onClick={() => setSelectedRole('product')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedRole === 'product'
                    ? 'bg-brandPurple text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Product Manager
              </button>
            </div>
          </div>
        </div>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Before AI Card */}
          <div className="p-7 sm:p-8 rounded-3xl bg-[#0b1020] border border-rose-900/30 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                <XCircle className="w-5 h-5" />
                <span>Before Resume Builder AI</span>
              </div>
              <span className="text-xs font-bold text-rose-400 bg-rose-950/60 px-3 py-1 rounded-full border border-rose-800/40">
                {current.before.score}
              </span>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unoptimized Bullets:</div>
              <div className="space-y-2.5">
                {current.before.bullets.map((bullet, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-start space-x-2.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Identified Flaws:</div>
              <div className="flex flex-wrap gap-2">
                {current.before.drawbacks.map((item) => (
                  <span key={item} className="text-[11px] font-medium text-rose-400 bg-rose-950/40 border border-rose-900/40 px-2.5 py-1 rounded-lg">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* After AI Card */}
          <div className="p-7 sm:p-8 rounded-3xl bg-[#0b1020] border border-emerald-500/40 shadow-2xl shadow-emerald-500/5 space-y-6 relative overflow-hidden">
            {/* Top Glow Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>After Resume Builder AI</span>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
                {current.after.score}
              </span>
            </div>

            <div className="space-y-3 relative">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">AI-Engineered Bullets:</div>
              <div className="space-y-2.5">
                {current.after.bullets.map((bullet, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-900/30 text-xs text-slate-200 flex items-start space-x-2.5 shadow-sm">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 relative">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recruiter Upgrades:</div>
              <div className="flex flex-wrap gap-2">
                {current.after.improvements.map((item) => (
                  <span key={item} className="text-[11px] font-medium text-emerald-300 bg-emerald-950/50 border border-emerald-700/40 px-2.5 py-1 rounded-lg">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BeforeAfterSection;
