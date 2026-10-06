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
  ExternalLink
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ResumeUpload from '../components/ResumeUpload';
import api from '../services/api';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { fetchUserResumesFromSupabase, getResumeDownloadUrl } from '../services/supabaseResumeService';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Upload and Analysis state
  const [parsedData, setParsedData] = useState(null);
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
      
      // Basic deduplication by ID or filename
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

  const handleUploadSuccess = (data) => {
    setParsedData(data);
    const extracted = data?.extractedData || data?.improvedResume || data;
    if (extracted) {
      try {
        localStorage.setItem('resumeroast_pending_import', JSON.stringify({
          ...extracted,
          filename: data.filename
        }));
      } catch (e) {
        console.error('Failed to store pending import:', e);
      }
      toast.success('Resume extracted! Opening Resume Builder...', { icon: '✨' });
      navigate('/builder');
    }
  };

  const handleAnalyze = async () => {
    const finalRole = jobRole === 'Custom' ? customJobRole : jobRole;
    if (!finalRole) {
      toast.error('Please select or specify a target Job Role.');
      return;
    }
    if (!parsedData || !parsedData.originalText) {
      toast.error('Please upload a resume first.');
      return;
    }

    setAnalyzing(true);
    try {
      const { data } = await api.post('/resume/analyze', {
        originalText: parsedData.originalText,
        jobRole: finalRole,
        filename: parsedData.filename,
        size: parsedData.size
      });
      toast.success('Resume analyzed successfully!');
      navigate(`/analysis/${data._id}`);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Gemini AI analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Process data for Recharts chart
  const chartData = [...history]
    .reverse()
    .map(item => ({
      date: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: item.atsScore,
      role: item.jobRole
    }));

  if (loading || analyzing) {
    return <Loader fullScreen={analyzing} size="lg" />;
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">AI Resume Workspace</h2>
          <p className="text-slate-400 text-sm mt-1">
            Optimize your technical profile, check ATS keywords, and polish summaries.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload and Selection Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-brandPurple" />
              <span>1. Load Resume PDF</span>
            </h3>
            
            <ResumeUpload onUploadSuccess={handleUploadSuccess} />

            {parsedData && (
              <div className="pt-4 space-y-4 border-t border-slate-800">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-brandBlue" />
                  <span>2. Target Position</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Select Role</label>
                    <select
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 focus:border-brandPurple focus:outline-none rounded-xl text-slate-200 transition-colors text-sm"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  {jobRole === 'Custom' && (
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Specify Position</label>
                      <input
                        type="text"
                        placeholder="e.g. Node.js Developer"
                        value={customJobRole}
                        onChange={(e) => setCustomJobRole(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 focus:border-brandPurple focus:outline-none rounded-xl text-white transition-colors text-sm"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAnalyze}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-brandPurple to-brandBlue hover:opacity-95 text-white font-semibold rounded-xl shadow-lg shadow-brandPurple/20 transition-all flex items-center justify-center space-x-2"
                >
                  <Flame className="w-5 h-5 animate-pulse" />
                  <span>Roast & Analyze Resume</span>
                </button>
              </div>
            )}
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
                    key={item._id}
                    className="flex flex-col p-3.5 bg-slate-950/40 hover:bg-slate-950 border border-slate-850 hover:border-slate-850 rounded-xl transition-all group"
                  >
                    <div 
                      onClick={() => {
                        if (item.isSupabase) {
                          if (item.extracted_data) {
                            localStorage.setItem('resumeroast_pending_import', JSON.stringify({
                              ...item.extracted_data,
                              filename: item.filename
                            }));
                          }
                          navigate('/builder');
                        } else {
                          navigate(`/analysis/${item._id}`);
                        }
                      }}
                      title={item.originalFile?.filename || 'Resume'}
                      className="cursor-pointer flex items-center justify-between"
                    >
                      <div className="space-y-1 text-left min-w-0 pr-2">
                        <h4 className="text-sm font-semibold text-white truncate" title={item.originalFile?.filename || 'Resume'}>
                          {item.originalFile?.filename}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                          <span className="truncate max-w-[120px]">{item.jobRole}</span>
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
    </div>
  );
};

export default Dashboard;
