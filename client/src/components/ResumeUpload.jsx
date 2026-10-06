import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { saveResumeToSupabase } from '../services/supabaseResumeService';

const ResumeUpload = ({ onUploadSuccess }) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        toast.error('File is too large. Max size is 5MB.');
      } else {
        toast.error(error.message || 'Only PDF files are supported.');
      }
      return;
    }

    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.success(`${selectedFile.name} loaded.`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a PDF file first.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('file', file);

    setUploading(true);
    const toastId = toast.loading('Extracting text from PDF...');

    try {
      const { data } = await api.post('/resume/upload', formData);

      // Save original PDF to Supabase Storage & DB
      if (user) {
        try {
          const supabaseResult = await saveResumeToSupabase(
            file,
            user,
            data?.extractedData || data?.improvedResume || null
          );
          if (supabaseResult) {
            data.supabaseStorage = supabaseResult;
          }
        } catch (storageErr) {
          console.warn('Supabase storage backup notice:', storageErr);
        }
      }

      toast.success('Resume extracted & saved!', { id: toastId });
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || error.message || 'Failed to parse resume PDF. Ensure it is not protected.';
      toast.error(errMsg, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        title={file ? file.name : "Click or Drag & Drop PDF Resume file here"}
        className={`glass-panel border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all ${
          isDragActive 
            ? 'border-brandPurple bg-brandPurple/10' 
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            <UploadCloud className="w-10 h-10 text-brandPurple" />
          </div>
          
          {file ? (
            <div className="space-y-1" title={file.name}>
              <div className="flex items-center justify-center space-x-2 text-white font-medium">
                <File className="w-5 h-5 text-brandPurple" />
                <span className="truncate max-w-md" title={file.name}>{file.name}</span>
              </div>
              <p className="text-xs text-slate-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-white font-medium text-base">
                Drag & drop your resume PDF here, or <span className="text-brandPurple">browse</span>
              </p>
              <p className="text-xs text-slate-500">
                Supports single-column, standard PDF resumes up to 5MB.
              </p>
            </div>
          )}
        </div>
      </div>

      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full py-3 bg-gradient-to-r from-brandPurple to-brandBlue hover:opacity-95 text-white font-semibold rounded-xl shadow-lg shadow-brandPurple/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {uploading ? 'Extracting text...' : 'Extract text from PDF'}
        </button>
      )}
    </div>
  );
};

export default ResumeUpload;
