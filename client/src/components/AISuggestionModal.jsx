import React from 'react';
import { Sparkles, Check, X, PlusCircle, RefreshCw } from 'lucide-react';

const AISuggestionModal = ({ isOpen, onClose, title, originalContent, suggestedContent, onAcceptReplace, onAcceptAppend }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6 text-left">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2 text-brandPurple font-bold text-base">
            <Sparkles className="w-5 h-5 animate-pulse text-brandPurple" />
            <span>AI Suggestion Review - {title}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {originalContent && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Original Text</label>
              <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-xl text-slate-400 max-h-32 overflow-y-auto leading-relaxed">
                {typeof originalContent === 'object' ? JSON.stringify(originalContent, null, 2) : originalContent}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>✨ AI Generated Suggestion</span>
            </label>
            <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-slate-100 font-medium max-h-56 overflow-y-auto leading-relaxed whitespace-pre-wrap">
              {typeof suggestedContent === 'object' ? JSON.stringify(suggestedContent, null, 2) : suggestedContent}
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all flex items-center space-x-1.5"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span>Reject</span>
          </button>

          {onAcceptAppend && originalContent && (
            <button
              onClick={onAcceptAppend}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-brandBlue font-semibold rounded-xl text-xs transition-all flex items-center space-x-1.5 border border-slate-700"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Append to Existing</span>
            </button>
          )}

          <button
            onClick={onAcceptReplace}
            className="px-4 py-2 bg-gradient-to-r from-brandPurple to-brandBlue hover:opacity-95 text-white font-bold rounded-xl text-xs transition-all shadow flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Accept (Replace)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISuggestionModal;
