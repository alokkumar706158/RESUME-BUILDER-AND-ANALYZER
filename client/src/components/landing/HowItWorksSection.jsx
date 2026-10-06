import React from 'react';
import { UploadCloud, Cpu, Download, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      icon: UploadCloud,
      title: 'Upload or Build from Scratch',
      description: 'Import your existing PDF/DOCX or start with our guided, section-by-section smart input prompts.',
      highlight: 'Takes 60 seconds',
    },
    {
      number: '02',
      icon: Cpu,
      title: 'Let AI Analyze & Improve',
      description: 'Our engine identifies missing keywords, enhances bullet metrics, and tailors phrases for your dream job description.',
      highlight: 'Deep ATS scan',
    },
    {
      number: '03',
      icon: Download,
      title: 'Download & Get Hired',
      description: 'Export in clean, ATS-compliant PDF or DOCX format ready to submit directly to corporate portals.',
      highlight: 'Instant PDF export',
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 md:py-32 bg-[#050811] border-t border-slate-800/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <span>Seamless Workflow</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            How It Works in <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-brandPurple">Three Simple Steps</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            No design skills or prompt engineering required. Simply follow the guided steps.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="relative p-8 rounded-3xl bg-[#0b1020] border border-slate-800 hover:border-slate-700 transition duration-300 group flex flex-col justify-between"
              >
                {/* Step Number Watermark */}
                <div className="text-6xl font-black text-slate-800/60 font-mono mb-6 group-hover:text-brandPurple/30 transition-colors">
                  {step.number}
                </div>

                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-105 group-hover:border-cyan-500/40 transition">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400">
                  <span>{step.highlight}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
