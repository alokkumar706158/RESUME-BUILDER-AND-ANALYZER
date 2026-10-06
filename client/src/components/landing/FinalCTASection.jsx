import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, DownloadCloud, FileCheck } from 'lucide-react';
import TextReveal from './TextReveal';

export default function FinalCTASection() {
  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-[#050811] overflow-hidden">
      {/* Dynamic radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-purple-600/20 via-blue-600/25 to-pink-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0d_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="relative rounded-3xl bg-gradient-to-b from-[#131b2e]/95 via-[#0d1424]/90 to-[#070b14]/95 border border-slate-700/60 p-8 sm:p-14 lg:p-16 backdrop-blur-2xl text-center shadow-2xl shadow-purple-950/30 overflow-hidden">
          {/* Subtle accent border on top */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-24 bg-purple-500/30 blur-2xl pointer-events-none rounded-full" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-8 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Start Building in 60 Seconds</span>
          </div>

          {/* Headline */}
          <TextReveal
            as="h2"
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6 max-w-3xl mx-auto"
          >
            Your next opportunity starts with a better resume.
          </TextReveal>

          {/* Subtitle */}
          <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Stop losing out to automated filters and generic applicants. Transform your career story into an ATS-optimized, high-impact resume today.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <a
              href="/builder"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-base shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all group"
            >
              <span>Build My Resume with AI</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="/analyzer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 hover:text-white font-medium text-base backdrop-blur-md hover:border-slate-600 transition-all"
            >
              <span>Check ATS Score Free</span>
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Instant AI generation</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-400" />
              <span>ATS-tested PDF export</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
