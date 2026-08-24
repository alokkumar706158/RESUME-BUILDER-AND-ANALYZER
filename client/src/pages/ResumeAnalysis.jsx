import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Flame, 
  Sparkles, 
  Download, 
  Trash2, 
  Edit, 
  Plus, 
  Trash, 
  ChevronLeft,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  FolderKanban,
  FileBadge
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import ATSGauge from '../components/ATSGauge';
import ResumeBuilder from './ResumeBuilder';
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

const ResumeAnalysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [resume, setResume] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab state synchronized with URL search parameter & browser history stack
  const tabFromUrl = searchParams.get('tab');
  const [internalTab, setInternalTab] = useState(tabFromUrl || 'overview');

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== internalTab) {
      setInternalTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const activeTab = internalTab;

  const setActiveTab = (tabOrFn) => {
    setInternalTab(prev => {
      const nextTab = typeof tabOrFn === 'function' ? tabOrFn(prev) : tabOrFn;
      const newParams = new URLSearchParams(window.location.search);
      newParams.set('tab', nextTab);
      setSearchParams(newParams, { replace: false });
      return nextTab;
    });
  };

  // Rewrite / Editor states
  const [rewriteInstructions, setRewriteInstructions] = useState({
    summary: '',
    skills: '',
    experience: '',
    projects: '',
    education: '',
    achievements: ''
  });
  const [rewritingSection, setRewritingSection] = useState(null);
  const [savingManual, setSavingManual] = useState(false);

  // Template State
  const [selectedTemplate, setSelectedTemplate] = useState('classic');

  const fetchResumeDetails = async () => {
    try {
      const { data } = await api.get(`/resume/${id}`);
      setResume(data.resume);
      setHistory(data.history);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load analysis results.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumeDetails();
  }, [id]);

  const handleDownload = async () => {
    const toastId = toast.loading('Compiling PDF...');
    try {
      const response = await api.post('/resume/download', {
        resumeId: id,
        template: selectedTemplate
      }, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `ResumeRoast_${resume.jobRole.replace(/\s+/g, '_')}.pdf`;
      link.click();
      toast.success('Resume downloaded!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to compile PDF resume.', { id: toastId });
    }
  };

  const handleFixItForMe = async (sectionName) => {
    const instruction = rewriteInstructions[sectionName] || `Optimize this ${sectionName} section. Add metrics, action verbs and keywords for ${resume.jobRole}.`;
    
    setRewritingSection(sectionName);
    const toastId = toast.loading(`AI is rewriting ${sectionName}...`);

    try {
      const { data } = await api.post('/resume/rewrite', {
        resumeId: id,
        sectionName,
        instruction
      });

      setResume(data.resume);
      toast.success(`${sectionName.toUpperCase()} section rewritten!`, { id: toastId });
      
      // Update local history
      setHistory(prev => [data.newHistoryVersion, ...prev]);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to rewrite section.', { id: toastId });
    } finally {
      setRewritingSection(null);
    }
  };

  const handleFixEntireResume = async () => {
    setRewritingSection('all');
    const toastId = toast.loading('AI is rewriting the entire resume...');

    try {
      const { data } = await api.post('/resume/rewrite-all', {
        resumeId: id
      });

      setResume(data.resume);
      toast.success('Entire resume rewritten!', { id: toastId });
      setHistory(prev => [data.newHistoryVersion, ...prev]);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to rewrite entire resume.', { id: toastId });
    } finally {
      setRewritingSection(null);
    }
  };

  const handleSaveManualEdits = async () => {
    setSavingManual(true);
    const toastId = toast.loading('Saving changes...');
    try {
      const { data } = await api.put('/resume/update', {
        resumeId: id,
        improvedResume: resume.improvedResume
      });
      setResume(data);
      toast.success('Resume saved successfully!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to save edits.', { id: toastId });
    } finally {
      setSavingManual(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) return;
    try {
      await api.delete(`/resume/${id}`);
      toast.success('Analysis deleted.');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete analysis.');
    }
  };

  // Helper to update deeply nested states in improvedResume
  const updateResumeField = (section, index, field, value) => {
    const updated = { ...resume.improvedResume };
    if (index !== null && Array.isArray(updated[section])) {
      updated[section][index][field] = value;
    } else {
      updated[section] = value;
    }
    setResume({ ...resume, improvedResume: updated });
  };

  const updateBulletField = (section, itemIndex, bulletIndex, value) => {
    const updated = { ...resume.improvedResume };
    updated[section][itemIndex].description[bulletIndex] = value;
    setResume({ ...resume, improvedResume: updated });
  };

  const addBulletPoint = (section, itemIndex) => {
    const updated = { ...resume.improvedResume };
    updated[section][itemIndex].description.push('');
    setResume({ ...resume, improvedResume: updated });
  };

  const removeBulletPoint = (section, itemIndex, bulletIndex) => {
    const updated = { ...resume.improvedResume };
    updated[section][itemIndex].description.splice(bulletIndex, 1);
    setResume({ ...resume, improvedResume: updated });
  };

  const addListItem = (section, templateObj) => {
    const updated = { ...resume.improvedResume };
    updated[section] = [...(updated[section] || []), templateObj];
    setResume({ ...resume, improvedResume: updated });
  };

  const removeListItem = (section, index) => {
    const updated = { ...resume.improvedResume };
    updated[section].splice(index, 1);
    setResume({ ...resume, improvedResume: updated });
  };

  if (loading) {
    return <Loader size="lg" />;
  }

  const improved = resume.improvedResume || {};
  const analysis = resume.analysis || {};
  const graphData = analysis.graphData || {};
  const chartData = [
    { name: 'ATS Friendliness', value: graphData.atsFriendliness ?? 0 },
    { name: 'Resume Quality', value: graphData.resumeQuality ?? 0 },
    { name: 'Job Match', value: graphData.jobMatch ?? 0 },
    { name: 'Keyword Match', value: graphData.keywordMatch ?? 0 },
    { name: 'Skills', value: graphData.skills ?? 0 },
    { name: 'Projects', value: graphData.projects ?? 0 },
    { name: 'Experience', value: graphData.experience ?? 0 },
    { name: 'Education', value: graphData.education ?? 0 },
    { name: 'Grammar', value: graphData.grammar ?? 0 },
    { name: 'Spelling', value: graphData.spelling ?? 0 },
    { name: 'Formatting', value: graphData.formatting ?? 0 },
    { name: 'Readability', value: graphData.readability ?? 0 },
    { name: 'Professionalism', value: graphData.professionalism ?? 0 }
  ];

  return (
    <div className="space-y-8">
      {/* Back navigation & Actions */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <button
          onClick={() => {
            if (activeTab !== 'overview') {
              setActiveTab('overview');
            } else {
              navigate('/dashboard');
            }
          }}
          className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
          title={activeTab !== 'overview' ? "Overview Tab" : "Dashboard"}
        >
          <ChevronLeft className="w-5 h-5 text-orange-400" />
          <span>{activeTab !== 'overview' ? 'Pichla Tab (Overview)' : 'Back to Workspace'}</span>
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center space-x-1.5 text-rose-500 hover:text-rose-400 transition-colors text-sm font-semibold"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Scan</span>
        </button>
      </div>

      {/* Main Analysis Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="md:col-span-3 space-y-4">
          <div className="space-y-1">
            <h2 
              className="text-2xl font-extrabold text-white tracking-tight"
              title={resume.originalFile?.filename || 'Resume'}
            >
              {resume.originalFile?.filename}
            </h2>
            <p className="text-slate-400 text-sm">
              Analyzed for role: <span className="text-brandPurple font-semibold">{resume.jobRole}</span>
            </p>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
            <strong className="text-slate-200">Recommendation:</strong> {analysis.summary || resume.feedback.finalRecommendation}
          </p>
        </div>
        <div className="flex justify-center">
          <ATSGauge score={resume.atsScore} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-8 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: CheckCircle },
          { id: 'roast', label: 'Review & Roast', icon: Flame },
          { id: 'keywords', label: 'Missing Keywords', icon: AlertTriangle },
          { id: 'editor', label: 'Resume Editor', icon: Edit },
          { id: 'download', label: 'Export PDF', icon: Download }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-brandPurple text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white">Scores Breakdown</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Status</div>
                  <div className="text-brandPurple text-xl font-extrabold mt-1">{analysis.status || 'N/A'}</div>
                </div>
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Overall ATS</div>
                  <div className="text-white text-2xl font-extrabold mt-1">{analysis.overallATS ?? resume.atsScore}</div>
                </div>
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Job Match</div>
                  <div className={`text-2xl font-extrabold mt-1 ${
                    analysis.colors?.jobMatch === 'green' ? 'text-emerald-400' :
                    analysis.colors?.jobMatch === 'orange' ? 'text-amber-400' :
                    analysis.colors?.jobMatch === 'red' ? 'text-rose-400' : 'text-brandBlue'
                  }`}>{analysis.progress?.jobMatch ?? 0}%</div>
                </div>
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Keyword Match</div>
                  <div className={`text-2xl font-extrabold mt-1 ${
                    analysis.colors?.keywordMatch === 'green' ? 'text-emerald-400' :
                    analysis.colors?.keywordMatch === 'orange' ? 'text-amber-400' :
                    analysis.colors?.keywordMatch === 'red' ? 'text-rose-400' : 'text-brandBlue'
                  }`}>{analysis.progress?.keywordMatch ?? 0}%</div>
                </div>
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Resume Quality</div>
                  <div className={`text-2xl font-extrabold mt-1 ${
                    analysis.colors?.resumeQuality === 'green' ? 'text-emerald-400' :
                    analysis.colors?.resumeQuality === 'orange' ? 'text-amber-400' :
                    analysis.colors?.resumeQuality === 'red' ? 'text-rose-400' : 'text-brandBlue'
                  }`}>{analysis.progress?.resumeQuality ?? 0}%</div>
                </div>
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Recruiter Decision</div>
                  <div className="text-white text-lg font-extrabold mt-1 truncate">{analysis.recruiterDecision || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white">Graph</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={chartData}>
                    <PolarGrid stroke="rgba(148,163,184,0.25)" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Radar dataKey="value" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.18} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 text-left">
            <h3 className="text-lg font-bold text-white">Summary</h3>
            <div className="text-sm text-slate-300 leading-relaxed space-y-2">
              <p className="text-slate-300">{analysis.summary}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 text-left">
              <h3 className="text-lg font-bold text-white">Category Progress</h3>
              <div className="space-y-3 text-sm">
                {analysis.progress && Object.entries(analysis.progress).map(([key, value]) => {
                  if (key === 'jobMatch' || key === 'keywordMatch' || key === 'resumeQuality') return null; // already shown
                  const colorMap = {
                    green: 'bg-emerald-400',
                    blue: 'bg-brandBlue',
                    orange: 'bg-amber-400',
                    red: 'bg-rose-400'
                  };
                  const color = analysis.colors?.[key] || 'blue';
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="capitalize text-slate-300">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-white font-bold">{value}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${colorMap[color]}`} style={{ width: `${value}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 text-left">
              <h3 className="text-lg font-bold text-white">Recruiter Decision</h3>
              <div className="text-sm text-slate-400 space-y-2">
                <p>
                  <span className="text-slate-200 font-semibold">Decision:</span>{' '}
                  <span className="text-slate-300 font-bold">{analysis.recruiterDecision || 'N/A'}</span>
                </p>
                <p className="text-slate-400 leading-relaxed">{analysis.summary}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roast' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* Roast Column */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-rose-950/20 via-slate-900/40 to-slate-900/60 p-6 rounded-2xl border border-rose-900/20 space-y-4">
              <h3 className="text-lg font-bold text-rose-400 flex items-center space-x-2">
                <Flame className="w-5 h-5 text-rose-500 animate-bounce" />
                <span>The AI Roast</span>
              </h3>
              <p className="text-sm italic text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-rose-900/10">
                "{resume.feedback.honestRoast || analysis.summary}"
              </p>
            </div>
            
            {/* Spelling Mistakes */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-amber-400 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Spelling Mistakes</span>
              </h3>
              {(!analysis.spellingMistakes || analysis.spellingMistakes.length === 0) ? (
                <p className="text-xs text-slate-500">No spelling mistakes found.</p>
              ) : (
                <div className="space-y-3 text-sm divide-y divide-slate-850">
                  {analysis.spellingMistakes.map((err, idx) => (
                    <div key={idx} className="pt-2">
                      <div className="text-rose-400 line-through">{err.wrong}</div>
                      <div className="text-emerald-400 font-semibold">{err.correct}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section Feedback Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-brandPurple" />
                <span>Top 10 Improvements</span>
              </h3>
              
              <div className="space-y-3 text-sm">
                {(analysis.improvements || []).map((imp, idx) => (
                  <div key={idx} className="flex space-x-3 items-start p-3 bg-slate-900/50 rounded-lg">
                    <span className="flex-shrink-0 text-brandPurple font-bold">{idx + 1}.</span>
                    <span className="text-slate-300">{imp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Edit className="w-5 h-5 text-brandBlue" />
                <span>Grammar Suggestions</span>
              </h3>
              
              {(!analysis.grammarMistakes || analysis.grammarMistakes.length === 0) ? (
                <p className="text-sm text-slate-500 py-4">No major grammar mistakes detected.</p>
              ) : (
                <div className="space-y-4 text-sm divide-y divide-slate-850">
                  {analysis.grammarMistakes.map((err, idx) => (
                    <div key={idx} className="pt-3 space-y-1">
                      <p className="text-slate-400 italic">"...{err.text}..."</p>
                      <p className="text-emerald-400 font-semibold">Fix: {err.fix}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'keywords' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Recommended Target Keywords</span>
            </h3>
            
            {(!analysis.missingKeywords || analysis.missingKeywords.length === 0) ? (
              <p className="text-sm text-slate-500 py-6 text-center">Excellent! No missing keywords detected for this target position.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.missingKeywords.map((kw, idx) => (
                  <div key={idx} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-center">
                    <span className="font-bold text-base text-white text-center">{kw}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'editor' && (
        <ResumeBuilder resumeIdProp={id} isEmbedded={true} />
      )}

      {activeTab === 'download' && (
        <div className="max-w-xl mx-auto glass-panel p-8 rounded-2xl border border-slate-800 space-y-8 text-center">
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-white">Generate Improved Resume PDF</h3>
            <p className="text-slate-400 text-sm">Select your styling template, review final details, and download.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { id: 'classic', label: 'Classic Minimalist', desc: 'Serif fonts, clean lines, single column. Standard ATS engine.' },
              { id: 'modern', label: 'Modern Professional', desc: 'Sans-serif typography, Slate accents, structured spacing.' },
              { id: 'recommended', label: 'Recommended ATS', desc: 'Top middle personal info with profile photo in top right corner.' }
            ].map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`p-4 bg-slate-950/40 rounded-xl border text-xs flex flex-col space-y-2 transition-all ${
                  selectedTemplate === tmpl.id
                    ? 'border-brandPurple bg-slate-950'
                    : 'border-slate-850 hover:border-slate-800'
                }`}
              >
                <span className="font-bold text-white text-sm">{tmpl.label}</span>
                <span className="text-slate-500 leading-relaxed">{tmpl.desc}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleDownload}
            className="w-full py-3.5 bg-gradient-to-r from-brandPurple to-brandBlue hover:opacity-95 text-white font-semibold rounded-xl shadow-lg shadow-brandPurple/20 transition-all flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Download PDF Resume</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalysis;
