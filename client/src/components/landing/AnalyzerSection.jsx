import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AnalyzerSection = () => {
  const scoreBreakdown = [
    { name: 'Keyword Match', score: 92, status: 'Excellent', color: 'bg-emerald-400', textColor: 'text-emerald-400' },
    { name: 'Formatting & Layout', score: 95, status: 'Perfect', color: 'bg-cyan-400', textColor: 'text-cyan-400' },
    { name: 'Technical Skills', score: 88, status: 'Strong', color: 'bg-brandPurple', textColor: 'text-brandPurple' },
    { name: 'Experience Relevance', score: 84, status: 'Good', color: 'bg-blue-400', textColor: 'text-blue-400' },
    { name: 'Measurable Impact', score: 80, status: 'Needs Polish', color: 'bg-amber-400', textColor: 'text-amber-400' },
  ];

  const suggestions = [
    {
      type: 'critical',
      title: 'Add 3 missing target keywords',
      detail: 'Adding "Kubernetes", "GraphQL", and "System Design" will elevate keyword match from 92% to 99%.',
    },
    {
      type: 'improvement',
      title: 'Quantify 2 work experience bullet points',
      detail: 'Add metrics (e.g., "$ revenue saved", "% latency reduced") to reinforce seniority proof.',
    },
    {
      type: 'good',
      title: 'Formatting passes 100% of standard parser filters',
      detail: 'Clean headings, standard date formatting, and UTF-8 typography verified.',
    },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-[#050811] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/3 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Real-Time Audit</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Comprehensive <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-brandPurple">ATS Intelligence</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            See exactly how hiring systems and senior recruiters evaluate your resume before you submit an application.
          </p>
        </div>

        {/* Dashboard Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Overall Score & Meters */}
          <div className="lg:col-span-6 rounded-3xl bg-[#0b1020] border border-slate-800 p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Readiness</span>
                <h3 className="text-2xl font-black text-white mt-1">ATS Score 87/100</h3>
              </div>
              <div className="px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Interview Ready</span>
              </div>
            </div>

            {/* Score Breakdown Progress Bars */}
            <div className="space-y-4">
              {scoreBreakdown.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">{item.name}</span>
                    <span className="font-bold text-white">{item.score}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Benchmarked against 5,000+ hired profiles</span>
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                Top 8% Tier <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Right Column: Actionable AI Suggestions */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-2 sm:p-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brandPurple flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-400" /> Actionable Recommendations
              </span>
              <h3 className="text-2xl font-extrabold text-white">Smart Fixes, Instantly Applied</h3>
              <p className="text-slate-400 text-sm mt-1">Our engine points out exact phrasing gaps and offers 1-click upgrades.</p>
            </div>

            <div className="space-y-3.5">
              {suggestions.map((sugg, i) => (
                <motion.div
                  key={sugg.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="p-5 rounded-2xl bg-[#0e1628]/90 border border-slate-800 hover:border-slate-700 transition space-y-2"
                >
                  <div className="flex items-center space-x-2.5">
                    {sugg.type === 'critical' && <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                    {sugg.type === 'improvement' && <TrendingUp className="w-4 h-4 text-brandPurple flex-shrink-0" />}
                    {sugg.type === 'good' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    <h4 className="text-sm font-bold text-white">{sugg.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-6.5">
                    {sugg.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AnalyzerSection;
