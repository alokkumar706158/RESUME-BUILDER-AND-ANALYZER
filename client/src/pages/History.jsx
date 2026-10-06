import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Trash2, 
  Download, 
  ArrowUpRight, 
  Briefcase, 
  Calendar 
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { fetchUserResumesFromSupabase, deleteUserResumeFromSupabase } from '../services/supabaseResumeService';

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      let mongoHistory = [];
      try {
        const { data } = await api.get('/resume/history');
        mongoHistory = data || [];
      } catch (err) {
        console.warn('MongoDB history error:', err.message);
      }

      let supabaseHistory = [];
      if (user) {
        supabaseHistory = await fetchUserResumesFromSupabase(user);
      }

      const combined = [...supabaseHistory, ...mongoHistory].sort((a, b) => 
        new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
      );

      const unique = Array.from(new Map(combined.map(item => [item._id || item.filename, item])).values());
      setResumes(unique);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load scan catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (item, e) => {
    e.preventDefault();
    if (!window.confirm('Delete this resume permanently?')) return;

    try {
      if (item.isSupabase) {
        await deleteUserResumeFromSupabase(item._id, item.file_path, user);
      } else {
        await api.delete(`/resume/${item._id}`);
      }
      setResumes(resumes.filter(r => r._id !== item._id));
      toast.success('Resume deleted.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete resume.');
    }
  };

  const handleDownload = async (id, role, e) => {
    e.preventDefault();
    const toastId = toast.loading('Compiling PDF...');
    try {
      const response = await api.post('/resume/download', {
        resumeId: id,
        template: 'classic'
      }, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Resume_${role.replace(/\s+/g, '_')}.pdf`;
      link.click();
      toast.success('Download initiated!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to compile PDF resume.', { id: toastId });
    }
  };

  if (loading) {
    return <Loader size="lg" />;
  }

  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Scan Catalog</h2>
        <p className="text-slate-400 text-sm mt-1">
          Review and download previous resume evaluations and optimization histories.
        </p>
      </div>

      {resumes.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-4">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No scans found</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            You haven't uploaded or analyzed any resumes yet. Head over to the workspace to scan your first profile.
          </p>
          <Link
            to="/dashboard"
            className="inline-block px-6 py-2.5 bg-gradient-to-r from-brandPurple to-brandBlue text-white font-semibold rounded-xl text-sm"
          >
            Upload Resume
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {resumes.map((item) => (
            <div
              key={item._id}
              className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800 flex flex-col justify-between group h-64 cursor-pointer"
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
            >
              <div className="space-y-4">
                {/* Top: title and score badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400" title={item.originalFile?.filename || 'Resume'}>
                    <FileText className="w-6 h-6 text-brandPurple" />
                  </div>
                  <span 
                    title={`ATS Score: ${item.atsScore}/100`}
                    className={`text-sm font-extrabold px-3 py-1 rounded-lg ${
                    item.atsScore >= 75 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                    item.atsScore >= 50 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' :
                    'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                  }`}>
                    Score: {item.atsScore}
                  </span>
                </div>

                {/* Middle: Details */}
                <div className="space-y-1">
                  <h4 
                    className="font-bold text-base text-white group-hover:text-brandPurple transition-colors truncate"
                    title={item.originalFile?.filename || 'Resume'}
                  >
                    {item.originalFile?.filename}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.jobRole}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(item.createdAt || item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-850 pt-4 mt-6">
                {item.isSupabase && item.file_url ? (
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-brandPurple hover:underline transition-colors"
                    title="View PDF"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>View PDF</span>
                  </a>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(item._id, item.jobRole, e);
                    }}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                    title="Quick Download"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                )}

                <div className="flex items-center space-x-3">
                  <span className="flex items-center text-xs font-bold text-brandPurple group-hover:underline">
                    <span>{item.isSupabase ? 'Edit in Builder' : 'View Scan'}</span>
                    <ArrowUpRight className="w-4 h-4 ml-0.5" />
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item, e);
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors"
                    title="Delete Scan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
