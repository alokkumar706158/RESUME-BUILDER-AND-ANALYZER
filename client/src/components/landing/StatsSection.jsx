import React from 'react';
import { FileCheck, ShieldCheck, Briefcase, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export const StatsSection = () => {
  const stats = [
    {
      icon: FileCheck,
      value: '10K+',
      label: 'Resumes Created',
      description: 'Built and downloaded by job seekers worldwide',
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      icon: ShieldCheck,
      value: '95%',
      label: 'ATS Optimization',
      description: 'Average pass rate through top hiring scanners',
      gradient: 'from-emerald-400 to-teal-500',
    },
    {
      icon: Briefcase,
      value: '50+',
      label: 'Job Roles',
      description: 'Tailored models for Tech, Product, Finance & more',
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      icon: Cpu,
      value: 'AI-Powered',
      label: 'Intelligence',
      description: 'Powered by Gemini 2.0 & LLM parsing engines',
      gradient: 'from-pink-500 to-purple-500',
    },
  ];

  return (
    <section className="relative py-12 md:py-16 bg-[#080d1a] border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative p-6 rounded-2xl bg-[#0e1628]/80 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brandPurple/5"
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brandPurple/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {stat.label}
                  </span>
                </div>

                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">
                  {stat.value}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {stat.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
