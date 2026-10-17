import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  ChevronRight, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Calendar,
  Briefcase,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Copy,
  RefreshCw,
  User,
  Mail,
  Phone,
  Wand2,
  Award,
  Target,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ResumeUpload from '../components/ResumeUpload';
import ATSGauge from '../components/ATSGauge';
import api from '../services/api';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { fetchUserResumesFromSupabase } from '../services/supabaseResumeService';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Upload and Analysis state
  const [parsedData, setParsedData] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [jobRole, setJobRole] = useState('Java Developer');
  const [customJobRole, setCustomJobRole] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const roles = [
    'Java Developer',
    'Frontend Developer',
    'Backend Developer',
    'AI Engineer',
    'Data Analyst',
    'Cloud Engineer',
    'Full Stack Developer',
    'Custom'
  ];

  const fetchHistory = async () => {
    try {
      // Fetch from MongoDB
      let mongoHistory = [];
      try {
        const { data } = await api.get('/resume/history');
        mongoHistory = data || [];
      } catch (err) {
        console.warn('MongoDB history fetch failed:', err.message);
      }
      
      // Fetch from Supabase
      let supabaseHistory = [];
      if (user) {
        supabaseHistory = await fetchUserResumesFromSupabase(user);
      }

      // Combine and remove duplicates based on filename/time
      const combined = [...supabaseHistory, ...mongoHistory].sort((a, b) => 
        new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
      );
      
      // Deduplicate by ID or filename
      const unique = Array.from(new Map(combined.map(item => [item._id || item.filename, item])).values());
      
      setHistory(unique);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load analysis history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const runResumeAnalysis = async (resumeSourceData, targetRole) => {
    const data = resumeSourceData || parsedData;
    if (!data || !data.originalText) {
      toast.error('Please upload a resume first.');
      return;
    }

    const finalRole = targetRole || (jobRole === 'Custom' ? customJobRole : jobRole) || 'Software Engineer';

    setAnalyzing(true);
    const toastId = toast.loading(`AI is analyzing resume for "${finalRole}"...`);

    try {
      const { data: analysisData } = await api.post('/resume/analyze', {
        originalText: data.originalText,
        jobRole: finalRole,
        filename: data.filename || 'resume.pdf',
        size: data.size || 0
      });

      setAnalysisResult(analysisData);
      toast.success('Resume analyzed! ATS score & keywords ready.', { id: toastId });

      // Update history list and chart so it appears dynamically
      setHistory((prev) => [analysisData, ...prev.filter((item) => item._id !== analysisData._id)]);

      // Pre-populate pending import in localStorage for Resume Builder
      const extracted = analysisData.improvedResume || data.extractedData || data.improvedResume;
      if (extracted) {
        try {
          localStorage.setItem(
            'resumeroast_pending_import',
            JSON.stringify({
              ...extracted,
              filename: data.filename || analysisData.originalFile?.filename,
              _id: analysisData._id,
              atsScore: analysisData.atsScore
            })
          );
        } catch (e) {
          console.error('Failed to store pending import:', e);
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.response?.data?.message || 'AI analysis failed. Please try again.', { id: toastId });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUploadSuccess = (data) => {
    setParsedData(data);
    const activeRole = jobRole === 'Custom' ? (customJobRole || 'Software Engineer') : jobRole;
    runResumeAnalysis(data, activeRole);
  };

  const handleOpenInBuilder = () => {
    if (!analysisResult && !parsedData) return;
    const extracted = analysisResult?.improvedResume || parsedData?.extractedData || parsedData?.improvedResume || {};
    try {
      localStorage.setItem('resumeroast_pending_import', JSON.stringify({
        ...extracted,
        filename: parsedData?.filename || analysisResult?.originalFile?.filename || 'resume.pdf',
        _id: analysisResult?._id,
        atsScore: analysisResult?.atsScore
      }));
    } catch (e) {
      console.error('Failed to store pending import:', e);
    }
    toast.success('Opening resume in builder...', { icon: '✨' });
    navigate('/builder');
  };

  const handleCopyKeywords = (keywords) => {
    if (!keywords || !keywords.length) return;
    navigator.clipboard.writeText(keywords.join(', '));
    toast.success('Missing keywords copied to clipboard!', { icon: '📋' });
  };

  const handleSelectHistoryItem = async (item) => {
    if (item.isSupabase) {
      if (item.extracted_data) {
        localStorage.setItem('resumeroast_pending_import', JSON.stringify({
          ...item.extracted_data,
          filename: item.filename
        }));
      }
      navigate('/builder');
    } else {
      try {
        setAnalyzing(true);
        const { data } = await api.get(`/resume/${item._id}`);
        if (data?.resume) {
          setAnalysisResult(data.resume);
          setParsedData({
            originalText: data.resume.originalText,
            filename: data.resume.originalFile?.filename || item.originalFile?.filename,
            size: data.resume.originalFile?.size || item.originalFile?.size,
            extractedData: data.resume.improvedResume
          });
          setJobRole(data.resume.jobRole || 'Java Developer');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (e) {
        navigate(`/analysis/${item._id}`);
      } finally {
        setAnalyzing(false);
      }
    }
  };

  // Process data for Recharts chart
  const chartData = [...history]
    .reverse()
    .map(item => ({
      date: new Date(item.createdAt || item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: item.atsScore,
      role: item.jobRole
    }));

  if (loading) {
    return <Loader fullScreen size="lg" />;
  }

  // Derived analysis values
  const missingKeywords = Array.isArray(analysisResult?.analysis?.missingKeywords)
    ? analysisResult.analysis.missingKeywords
    : Array.isArray(analysisResult?.feedback?.missingKeywords)
    ? analysisResult.feedback.missingKeywords
    : [];

  const contact =
    analysisResult?.improvedResume?.contactInfo ||
    parsedData?.extractedData?.contactInfo ||
    {};
  const candidateName = contact.fullName || contact.name || '';
  const candidateEmail = contact.email || '';
  const candidatePhone = contact.phone || '';
  const pdfUrl =
    parsedData?.localPdfUrl ||
    analysisResult?.supabaseStorage?.file_url ||
    analysisResult?.file_url ||
    '';
  const atsScore = Number(analysisResult?.atsScore ?? analysisResult?.analysis?.overallATS ?? 70);
  const statusText =
    analysisResult?.analysis?.status ||
    (atsScore >= 90
      ? 'Excellent'
      : atsScore >= 75
      ? 'Very Good'
      : atsScore >= 60
      ? 'Good'
      : atsScore >= 40
      ? 'Needs Improvement'
      : 'Poor');
  const recruiterDecision =
    analysisResult?.analysis?.recruiterDecision ||
    (atsScore >= 85 ? 'Strong Shortlist' : atsScore >= 70 ? 'Shortlist' : 'Under Review');
  const progress = analysisResult?.analysis?.progress || {};
  const summaryText =
    analysisResult?.analysis?.summary ||
    analysisResult?.feedback?.finalRecommendation ||
    analysisResult?.feedback?.honestRoast ||
    '';

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">AI Resume Workspace</h2>
          <p className="text-slate-400 text-sm mt-1">
            Import new resumes, inspect real-time ATS scores, and resolve missing keywords instantly.
          </p>
        </div>
      </div>

      {/* Analyzing Overlay Indicator */}
      {analyzing && (
        <div className="glass-panel p-8 rounded-2xl border border-brandPurple/40 bg-brandPurple/5 flex flex-col items-center justify-center space-y-4 animate-pulse">
          <Loader size="md" />
          <div className="text-center">
            <h3 className="text-lg font-bold text-white">AI Analysis in Progress...</h3>
            <p className="text-xs text-slate-400 mt-1">
              Extracting resume text, calculating ATS scores, and detecting missing keywords for {jobRole}.
            </p>
          </div>
        </div>
      )}

      {/* WHEN RESUME IS ANALYZED: SHOW ATS SCORE, MISSING KEYWORDS, AND PDF DETAILS */}
      {analysisResult && !analyzing && (
        <div className="space-y-6">
          {/* PDF Resume Info Header Bar */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5 min-w-0">
              <div className="p-3 rounded-xl bg-brandPurple/10 text-brandPurple border border-brandPurple/20 flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center space-x-2 flex-wrap">
                  <h4 className="text-base font-bold text-white truncate max-w-[280px] sm:max-w-[420px]">
                    {parsedData?.filename || analysisResult?.originalFile?.filename || 'Resume.pdf'}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {parsedData?.size ? `${(parsedData.size / 1024).toFixed(1)} KB` : 'PDF Document'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-brandPurple/20 text-brandPurple border border-brandPurple/30">
                    Analyzed for {analysisResult.jobRole || jobRole}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-400 flex-wrap gap-y-1">
                  {candidateName && (
                    <span className="flex items-center space-x-1 text-slate-300 font-medium">
                      <User className="w-3.5 h-3.5 text-brandBlue" />
                      <span>{candidateName}</span>
                    </span>
                  )}
                  {candidateEmail && (
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate max-w-[220px]">{candidateEmail}</span>
                    </span>
                  )}
                  {candidatePhone && (
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{candidatePhone}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-750 text-xs font-semibold text-slate-200 flex items-center space-x-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-brandPurple" />
                  <span>View Original PDF</span>
                </a>
              )}
              <button
                onClick={() => {
                  setAnalysisResult(null);
                  setParsedData(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center space-x-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Upload Another PDF</span>
              </button>
            </div>
          </div>

          {/* Quick Action CTA Banner */}
          <div className="glass-panel p-5 rounded-2xl border border-brandPurple/30 bg-gradient-to-r from-brandPurple/15 via-slate-900/50 to-brandBlue/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-brandPurple animate-pulse" />
                <span>Optimize this resume in the Builder</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically pre-populate all sections, generate 1-click professional summaries, and fill missing keywords.
              </p>
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={handleOpenInBuilder}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-brandPurple to-brandBlue hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-brandPurple/25 transition-all flex items-center justify-center space-x-2"
              >
                <Wand2 className="w-4 h-4" />
                <span>Open in Resume Builder</span>
              </button>
              <button
                onClick={() => navigate(`/analysis/${analysisResult._id}`)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Full Deep Roast</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Main 2-Column Grid: ATS Gauge on Left, Missing Keywords on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: ATS Score Gauge & Recruiter Verdict */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Award className="w-5 h-5 text-brandPurple" />
                    <span>ATS Compatibility</span>
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    atsScore >= 75 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                    atsScore >= 50 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                    'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {statusText}
                  </span>
                </div>

                <div className="py-6 flex flex-col items-center justify-center">
                  <ATSGauge score={atsScore} label="ATS Score" />
                  <div className="mt-3 text-center space-y-1">
                    <div className="text-xs text-slate-400">
                      Recruiter Decision: <span className="font-bold text-white">{recruiterDecision}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Re-Analyze for another position inline */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                  Re-Analyze For Position:
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-brandPurple focus:outline-none rounded-xl text-slate-200 text-xs"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const activeRole = jobRole === 'Custom' ? (customJobRole || 'Software Engineer') : jobRole;
                      runResumeAnalysis(parsedData, activeRole);
                    }}
                    disabled={analyzing}
                    className="px-3 py-2 bg-brandPurple/20 hover:bg-brandPurple/30 border border-brandPurple/30 text-purple-200 text-xs font-bold rounded-xl flex items-center space-x-1 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                    <span>Run</span>
                  </button>
                </div>
                {jobRole === 'Custom' && (
                  <input
                    type="text"
                    placeholder="e.g. Flutter Developer"
                    value={customJobRole}
                    onChange={(e) => setCustomJobRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-brandPurple focus:outline-none rounded-xl text-white text-xs mt-1"
                  />
                )}
              </div>
            </div>

            {/* Right Column (2 cols): Missing Keywords & Competency Analysis */}
            <div className="lg:col-span-2 space-y-6">
              {/* Missing Keywords Box */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-white">Missing Keywords</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          {missingKeywords.length} Missing
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        High-frequency keywords required for <span className="text-brandPurple font-semibold">{analysisResult.jobRole || jobRole}</span>
                      </p>
                    </div>
                  </div>

                  {missingKeywords.length > 0 && (
                    <button
                      onClick={() => handleCopyKeywords(missingKeywords)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-750 text-xs font-medium text-slate-300 flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
                      title="Copy all missing keywords to clipboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All</span>
                    </button>
                  )}
                </div>

                {missingKeywords.length > 0 ? (
                  <div className="space-y-3.5">
                    <div className="flex flex-wrap gap-2 pt-1">
                      {missingKeywords.map((keyword, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/15 text-rose-200 border border-rose-500/25 text-xs font-semibold transition-colors group cursor-default"
                          title={`Add ${keyword} to your skills or experience`}
                        >
                          <span className="text-rose-400 font-bold text-sm">+</span>
                          <span>{keyword}</span>
                        </span>
                      ))}
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-850 flex items-start space-x-2.5 text-xs text-slate-400">
                      <Sparkles className="w-4 h-4 text-brandPurple flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-200">ATS Strategy:</strong> Incorporate these missing keywords directly into your skills tags, project descriptions, or work experience bullet points. This will directly increase candidate ranking in Applicant Tracking Systems.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center space-x-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>Exceptional coverage! No critical keywords are missing for this position.</span>
                  </div>
                )}
              </div>

              {/* Progress Breakdown Bars */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Target className="w-4 h-4 text-brandBlue" />
                  <span>Category Performance</span>
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase">Keyword Match</div>
                    <div className="text-lg font-bold text-white mt-0.5">{progress.keywordMatch ?? atsScore}%</div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-brandPurple h-full rounded-full transition-all duration-500" style={{ width: `${progress.keywordMatch ?? atsScore}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase">Job Match</div>
                    <div className="text-lg font-bold text-white mt-0.5">{progress.jobMatch ?? atsScore}%</div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-brandBlue h-full rounded-full transition-all duration-500" style={{ width: `${progress.jobMatch ?? atsScore}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase">ATS Format</div>
                    <div className="text-lg font-bold text-white mt-0.5">{progress.atsFriendliness ?? atsScore}%</div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${progress.atsFriendliness ?? atsScore}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase">Skills Score</div>
                    <div className="text-lg font-bold text-white mt-0.5">{progress.skills ?? atsScore}%</div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${progress.skills ?? atsScore}%` }} />
                    </div>
                  </div>
                </div>

                {summaryText && (
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850 flex items-start space-x-2.5 text-xs text-slate-300">
                    <Flame className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300 mr-1">AI Summary:</strong>
                      <span>{summaryText}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WHEN NO RESUME IS CURRENTLY ANALYZED: SHOW DEFAULT UPLOAD ZONE */}
      {!analysisResult && !analyzing && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-brandPurple" />
                  <span>1. Load Resume PDF</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 font-medium">Target Role:</span>
                  <select
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-brandPurple focus:outline-none rounded-xl text-slate-200 text-xs"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <ResumeUpload onUploadSuccess={handleUploadSuccess} />
            </div>

            {/* Recharts Performance Trends */}
            {chartData.length > 0 && (
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span>ATS Score Growth</span>
                  </h3>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="#475569" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: '#131B2E', borderColor: '#1E293B', borderRadius: '12px' }}
                        labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                        itemStyle={{ color: '#F8FAFC' }}
                      />
                      <Area type="monotone" dataKey="score" name="ATS Score" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar history log */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-slate-400" />
                <span>Recent Submissions</span>
              </h3>
              
              {history.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">No evaluations yet. Upload a PDF to begin.</p>
              ) : (
                <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                  {history.slice(0, 5).map((item) => (
                    <div 
                      key={item._id || item.filename}
                      className="flex flex-col p-3.5 bg-slate-950/40 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl transition-all group"
                    >
                      <div 
                        onClick={() => handleSelectHistoryItem(item)}
                        title={item.originalFile?.filename || item.filename || 'Resume'}
                        className="cursor-pointer flex items-center justify-between"
                      >
                        <div className="space-y-1 text-left min-w-0 pr-2">
                          <h4 className="text-sm font-semibold text-white truncate max-w-[140px]">
                            {item.originalFile?.filename || item.filename}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-slate-500">
                            <span className="truncate max-w-[100px]">{item.jobRole}</span>
                            <span>•</span>
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{new Date(item.createdAt || item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            item.atsScore >= 75 ? 'bg-emerald-500/10 text-emerald-400' :
                            item.atsScore >= 50 ? 'bg-amber-500/10 text-amber-400' :
                            'bg-rose-500/10 text-rose-400'
                          }`}>
                            {item.atsScore}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </div>
                      </div>
                      
                      {item.isSupabase && item.file_url && (
                        <div className="mt-3 pt-3 border-t border-slate-800/50 flex justify-end">
                          <a 
                            href={item.file_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs text-brandPurple flex items-center hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-1" />
                            View Original PDF
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {history.length > 5 && (
                    <Link 
                      to="/history" 
                      className="block text-center text-xs font-semibold text-brandPurple hover:underline pt-2"
                    >
                      View All History ({history.length})
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History and Trends shown below analysis result if an analysis is active */}
      {analysisResult && !analyzing && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>ATS Score Growth Over Time</span>
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColorResult" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#475569" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#131B2E', borderColor: '#1E293B', borderRadius: '12px' }}
                    labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Area type="monotone" dataKey="score" name="ATS Score" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#scoreColorResult)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-slate-400" />
              <span>Other Submissions</span>
            </h3>
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {history.slice(0, 4).map((item) => (
                <div
                  key={item._id || item.filename}
                  onClick={() => handleSelectHistoryItem(item)}
                  className="p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="truncate pr-2">
                    <div className="font-semibold text-white truncate">{item.originalFile?.filename || item.filename}</div>
                    <div className="text-[11px] text-slate-500">{item.jobRole}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    item.atsScore >= 75 ? 'text-emerald-400 bg-emerald-500/10' :
                    item.atsScore >= 50 ? 'text-amber-400 bg-amber-500/10' :
                    'text-rose-400 bg-rose-500/10'
                  }`}>
                    {item.atsScore}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
