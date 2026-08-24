import React, { useState } from 'react';
import { UploadCloud, FileText, X, Sparkles, FileCode } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const TARGET_JOB_ROLES = [
  'Java Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'React Developer',
  'Node.js Developer',
  'Python Developer',
  'Data Analyst',
  'AI Engineer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Software Engineer',
  'Other'
];

const ImportResumeModal = ({ isOpen, onClose, onImportSuccess, defaultJobRole = 'Java Developer' }) => {
  if (!isOpen) return null;

  const [activeMode, setActiveMode] = useState('pdf'); // 'pdf' or 'json'
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState(defaultJobRole);
  const [uploading, setUploading] = useState(false);
  const [jsonText, setJsonText] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files && e.target.files[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit.');
        return;
      }
      setFile(selected);
      toast.success(`${selected.name} selected.`);
    }
  };

  const handleImportPDF = async () => {
    if (!file) {
      toast.error('Please select a PDF resume file first.');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Reading & Extracting text from PDF...');

    try {
      // 1. Upload & Parse text from PDF
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('file', file);

      const uploadRes = await api.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { originalText, filename, size } = uploadRes.data;

      if (!originalText || originalText.trim().length === 0) {
        throw new Error('Could not extract text from this PDF. Please ensure it is not an image-only/scanned PDF.');
      }

      toast.loading('AI is analyzing sections & building your resume...', { id: toastId });

      // 2. Analyze & extract structured resume using Gemini AI / Local Engine
      const analyzeRes = await api.post('/resume/analyze', {
        originalText,
        jobRole,
        filename: filename || file.name,
        size: size || file.size
      });

      toast.success('New Resume imported successfully!', { id: toastId });
      onImportSuccess(analyzeRes.data);
      onClose();
    } catch (err) {
      console.error('Import Resume Error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to import resume. Please try again.';
      toast.error(errMsg, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleImportJSON = () => {
    if (!jsonText.trim()) {
      toast.error('Please paste valid JSON resume data.');
      return;
    }
    try {
      const parsed = JSON.parse(jsonText);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid JSON object');
      }
      toast.success('JSON Resume Data imported!');
      onImportSuccess({
        isJsonImport: true,
        improvedResume: parsed
      });
      onClose();
    } catch (err) {
      toast.error('Invalid JSON format: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import New Resume</h3>
              <p className="text-xs text-slate-400">Upload PDF or paste JSON data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: PDF vs JSON */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
          <button
            type="button"
            onClick={() => setActiveMode('pdf')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition ${
              activeMode === 'pdf'
                ? 'bg-slate-800 text-orange-400 font-bold border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Upload PDF Resume</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('json')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition ${
              activeMode === 'json'
                ? 'bg-slate-800 text-amber-400 font-bold border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Paste JSON Backup</span>
          </button>
        </div>

        {activeMode === 'pdf' ? (
          <div className="space-y-4">
            {/* Target Job Role Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Job Role
              </label>
              <select
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {TARGET_JOB_ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* File Input Box */}
            <div className="border-2 border-dashed border-slate-800 hover:border-orange-500/50 bg-slate-950/60 p-6 rounded-2xl text-center space-y-3 transition">
              <input
                type="file"
                id="modal-resume-file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="modal-resume-file"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="p-3 bg-slate-900 rounded-full border border-slate-800 text-orange-400">
                  <UploadCloud className="w-8 h-8" />
                </div>
                {file ? (
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-xs">{file.name}</p>
                    <p className="text-[10px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-white">Click or Drag & Drop PDF Resume</p>
                    <p className="text-[10px] text-slate-500">Supports PDF format up to 5MB</p>
                  </div>
                )}
              </label>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex items-start space-x-2 text-[11px] text-slate-400">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>AI will extract personal info, work experience, projects, skills, education, and format them into the live builder.</span>
            </div>

            <button
              type="button"
              onClick={handleImportPDF}
              disabled={uploading || !file}
              className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{uploading ? 'Importing & Extracting...' : 'Parse & Import Resume'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                JSON Resume Object
              </label>
              <textarea
                rows={6}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='Paste JSON data here (e.g. { "contactInfo": {...}, "summary": "...", "skills": [...] })'
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs font-mono p-3 rounded-xl focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="button"
              onClick={handleImportJSON}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
            >
              <FileCode className="w-4 h-4" />
              <span>Load JSON Resume Data</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportResumeModal;
