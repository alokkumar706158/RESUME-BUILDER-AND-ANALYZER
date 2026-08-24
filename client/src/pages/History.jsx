import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

const History = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/resume/history');
      setResumes(data);
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

  const handleDelete = async (id, e) => {
    e.preventDefault(); // Stop click propagation to link wrapper
    if (!window.confirm('Delete this resume and all its version history permanently?')) return;

    try {
      await api.delete(`/resume/${id}`);
      setResumes(resumes.filter(item => item._id !== id));
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
            <Link
              key={item._id}
              to={`/analysis/${item._id}`}
              title={item.originalFile?.filename || 'Resume'}
              className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800 flex flex-col justify-between group h-64"
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
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-850 pt-4 mt-6">
                <button
                  onClick={(e) => handleDownload(item._id, item.jobRole, e)}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  title="Quick Download"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>

                <div className="flex items-center space-x-3">
                  <span className="flex items-center text-xs font-bold text-brandPurple group-hover:underline">
                    <span>View Scan</span>
                    <ArrowUpRight className="w-4 h-4 ml-0.5" />
                  </span>
                  <button
                    onClick={(e) => handleDelete(item._id, e)}
                    className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors"
                    title="Delete Scan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
