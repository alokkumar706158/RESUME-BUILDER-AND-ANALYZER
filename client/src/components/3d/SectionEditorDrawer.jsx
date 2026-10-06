import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowUpRight, Trash2, CheckCircle2, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SectionEditorDrawer = ({
  feature,
  isOpen,
  onClose,
  onRemoveFeature
}) => {
  const navigate = useNavigate();

  if (!feature || !isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#0c1224]/95 border border-indigo-500/50 rounded-3xl shadow-[0_0_60px_rgba(99,102,241,0.3)] p-6 sm:p-8 text-white backdrop-blur-2xl overflow-hidden"
        >
          {/* Ambient Glow in Modal */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900/80 border border-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-cyan-500/30 border border-purple-500/40 text-2xl">
              {feature.icon}
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active on Central 3D Resume</span>
              </div>
              <h3 className="text-xl font-black text-white leading-tight">
                {feature.title}
              </h3>
            </div>
          </div>

          {/* Description & Customization details */}
          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-sm text-slate-300 leading-relaxed">
              {feature.description}
            </div>

            {/* AI Suggestion Banner */}
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-start space-x-3">
              <Bot className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>AI Enhancement Active</span>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <p className="text-slate-300">
                  This section is automatically optimized with ATS keywords and action-oriented phrasing for target recruiter filters.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
            {/* Remove / Reverse Animation button */}
            <button
              onClick={() => {
                onRemoveFeature(feature.id);
                onClose();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl text-xs font-bold text-rose-400 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 transition hover:scale-[1.02]"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove & Fly Back to Orbit</span>
            </button>

            {/* Edit in Full Builder */}
            <button
              onClick={() => {
                onClose();
                navigate('/builder');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 transition hover:scale-[1.02]"
            >
              <span>Edit in Full Resume Builder</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SectionEditorDrawer;
