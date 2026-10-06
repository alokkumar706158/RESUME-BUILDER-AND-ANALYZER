import React, { useState } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Layout, 
  Eye, 
  Check, 
  Copy, 
  RefreshCw,
  FileCheck2,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BuilderMockupSection = () => {
  const [activeTab, setActiveTab] = useState('experience');
  const [isGenerating, setIsGenerating] = useState(false);

  const tabs = [
    { id: 'experience', label: 'Work Experience', icon: Wand2 },
    { id: 'summary', label: 'AI Summary Generator', icon: Sparkles },
    { id: 'templates', label: 'ATS Templates', icon: Layout },
    { id: 'preview', label: 'Live Instant Preview', icon: Eye },
  ];

  const handleSimulateAi = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 700);
  };

  return (
    <section id="templates" className="relative py-24 md:py-32 bg-[#070b16] border-t border-slate-800/80">
      {/* Background flare */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-brandPurple/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brandPurple/10 border border-brandPurple/30 text-brandPurple text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Editor</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Crafted by You. <span className="bg-clip-text text-transparent bg-gradient-to-r from-brandPurple to-cyan-400">Perfected by AI.</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Experience our distraction-free, intelligent builder with live preview, real-time suggestions, and instant layout switching.
          </p>
        </div>

        {/* Mockup Container Frame */}
        <div className="relative rounded-3xl bg-[#0b1020] border border-slate-700/80 shadow-2xl p-4 sm:p-8 backdrop-blur-xl overflow-hidden">
          {/* Top Window Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-800">
            {/* Window dots */}
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline-block">resume-editor.resumebuilder.ai</span>
            </div>

            {/* Interactive Feature Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-brandPurple to-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editor Workspace Mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Edit Controls (Interactive pane) */}
            <div className="lg:col-span-6 space-y-4">
              <AnimatePresence mode="wait">
                {activeTab === 'experience' && (
                  <motion.div
                    key="exp"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase text-slate-400">Position / Company</span>
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">Active Section</span>
                      </div>
                      <h4 className="text-white font-bold text-sm">Lead Software Engineer • Vercel Partner</h4>
                      <p className="text-slate-400 text-xs">San Francisco, CA • 2022 — Present</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Bullet Points</label>
                        <button
                          onClick={handleSimulateAi}
                          className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-brandPurple/20 hover:bg-brandPurple/30 border border-brandPurple/40 text-xs font-bold text-brandPurple transition"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                          <span>AI Enhance Verbs</span>
                        </button>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-[#0e1628] border border-slate-700/80 text-slate-300 flex items-start space-x-2">
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>Architected micro-frontend deployment pipeline reducing average staging build latency by <strong className="text-white">42%</strong> across 18 microservices.</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#0e1628] border border-slate-700/80 text-slate-300 flex items-start space-x-2">
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>Spearheaded TypeScript migration boosting developer velocity and eliminating 300+ runtime production anomalies.</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'summary' && (
                  <motion.div
                    key="sum"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-brandPurple flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> AI Summary Engine
                      </span>
                      <span className="text-[11px] text-slate-400">3 Variations Ready</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                      "Results-driven Engineering Leader specializing in modern TypeScript frameworks, Kubernetes cloud infrastructure, and large language model integration. Proven track record increasing enterprise user retention by 28%."
                    </p>
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition">
                      Insert Into Resume
                    </button>
                  </motion.div>
                )}

                {activeTab === 'templates' && (
                  <motion.div
                    key="tem"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    {['Classic ATS Minimal', 'Modern Tech Standard', 'Executive Clean', 'Engineering Linear'].map((tpl, i) => (
                      <div key={tpl} className={`p-3.5 rounded-xl border ${i === 1 ? 'border-brandPurple bg-brandPurple/10' : 'border-slate-800 bg-slate-900/70'} text-left cursor-pointer hover:border-slate-700 transition`}>
                        <div className="h-16 bg-slate-950/80 rounded-lg mb-2 flex items-center justify-center text-slate-600">
                          <Layout className="w-6 h-6 text-brandPurple" />
                        </div>
                        <div className="text-xs font-bold text-white">{tpl}</div>
                        <div className="text-[10px] text-emerald-400 mt-0.5">100% ATS Ready</div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'preview' && (
                  <motion.div
                    key="prev"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3"
                  >
                    <div className="text-xs font-bold text-white uppercase tracking-wider">Real-Time PDF Compilation</div>
                    <p className="text-xs text-slate-400">Zero lag rendering with instant standard page margin validation and clean typography scaling.</p>
                    <div className="flex items-center space-x-2 text-xs text-cyan-400 font-semibold">
                      <FileCheck2 className="w-4 h-4" />
                      <span>Single-Page Budget Checked</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Live Document Preview */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-8 text-slate-900 shadow-2xl min-h-[420px] font-sans text-left border border-slate-200">
              <div className="border-b-2 border-slate-900 pb-3 mb-4">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">ALEX CHEN</h3>
                <p className="text-xs text-indigo-700 font-semibold tracking-wide mt-0.5">SENIOR FULL-STACK SOFTWARE ARCHITECT</p>
                <p className="text-[11px] text-slate-600 mt-1">alex.chen@email.com • (555) 349-2041 • San Francisco, CA • linkedin.com/in/alexchen</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5 mb-1.5">
                    Professional Experience
                  </h4>
                  <div className="flex justify-between items-baseline text-xs font-bold text-slate-800">
                    <span>Lead Cloud Systems Engineer • Apex Tech Labs</span>
                    <span className="text-[10px] text-slate-500 font-normal">2022 — Present</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-slate-700 mt-1 space-y-1">
                    <li>Engineered automated CI/CD microservice workflow cutting deployment errors by 42%.</li>
                    <li>Integrated real-time vector search across 4M customer queries using pgvector and Node.js.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5 mb-1.5">
                    Skills & Technologies
                  </h4>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    <span className="font-semibold text-slate-900">Languages & Frameworks:</span> TypeScript, Python, React, Next.js, Node.js, Go, GraphQL<br />
                    <span className="font-semibold text-slate-900">Cloud & Tools:</span> AWS, Docker, Kubernetes, PostgreSQL, Redis, Terraform, Git
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuilderMockupSection;
