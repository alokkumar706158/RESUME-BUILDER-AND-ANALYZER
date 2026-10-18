import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pdfParse from 'pdf-parse';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { PDFDocument } from 'pdf-lib';
import Resume from '../models/Resume.js';
import ResumeHistory from '../models/ResumeHistory.js';
import User from '../models/User.js';
import { analyzeResumeText, rewriteEntireResume, rewriteResumeSection, executeSectionAIAction } from '../services/gemini.js';
import { analyzeResumeTextLocally } from '../services/localAnalyzer.js';
import { generateResumePDF } from '../utils/pdfGenerator.js';
import { generateResumeDOCX } from '../utils/docxGenerator.js';
import {
  uploadToGridFS,
  downloadFromGridFS,
  checkGridFSFileExists,
  deleteFromGridFS
} from '../utils/gridfs.js';

// Local disk storage root for uploaded PDFs (configurable for deployment).
const UPLOAD_ROOT = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(process.cwd(), 'uploads');

const sanitizeFilename = (name) =>
  (name || 'resume.pdf')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(-120);

// Persist an uploaded PDF buffer to disk under the owner's folder.
// Returns a relative path (POSIX style) safe to store in MongoDB.
const persistUploadedPdf = (buffer, userId, originalName) => {
  const ownerDir = path.join(UPLOAD_ROOT, String(userId));
  fs.mkdirSync(ownerDir, { recursive: true });

  const safeOriginal = sanitizeFilename(originalName);
  const storedName = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}_${safeOriginal}`;
  const absPath = path.join(ownerDir, storedName);
  fs.writeFileSync(absPath, buffer);

  const relPath = path.posix.join(String(userId), storedName);
  return { storedName, absPath, relPath, size: buffer.length, filename: originalName || 'resume.pdf' };
};

// Resolve a stored relative path to an absolute path, ensuring it stays inside UPLOAD_ROOT.
const resolveStoredPath = (relPath) => {
  if (!relPath) return null;
  const absPath = path.resolve(UPLOAD_ROOT, relPath);
  const rootWithSep = UPLOAD_ROOT.endsWith(path.sep) ? UPLOAD_ROOT : UPLOAD_ROOT + path.sep;
  if (absPath !== UPLOAD_ROOT && !absPath.startsWith(rootWithSep)) {
    return null;
  }
  return absPath;
};

const extractPdfText = async (buffer) => {
  let isPasswordProtected = false;
  let extracted = '';

  // Strategy 1: pdf-parse (Fast, robust Node.js text extraction)
  try {
    const data = await pdfParse(buffer);
    if (data && data.text && data.text.trim().length >= 15) {
      return { text: data.text.trim(), isPasswordProtected: false };
    }
  } catch (err) {
    const errMsg = (err.message || '').toLowerCase();
    if (errMsg.includes('password') || errMsg.includes('encrypted')) {
      return { text: '', isPasswordProtected: true };
    }
    console.warn('[PDF Import] pdf-parse fallback needed:', err.message);
  }

  // Strategy 2: Modern pdfjs-dist (legacy Node-compatible build)
  try {
    const uint8 = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({
      data: uint8,
      disableFontFace: true,
      stopAtErrors: false
    });
    const doc = await loadingTask.promise;
    const pageTexts = [];

    for (let i = 1; i <= doc.numPages; i++) {
      try {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        let lastY;
        let pageStr = '';
        for (const item of textContent.items) {
          if (lastY !== undefined && Math.abs((item.transform ? item.transform[5] : 0) - lastY) > 5) {
            pageStr += '\n';
          } else if (pageStr && !pageStr.endsWith(' ') && !pageStr.endsWith('\n')) {
            pageStr += ' ';
          }
          pageStr += item.str || '';
          lastY = item.transform ? item.transform[5] : lastY;
        }
        if (pageStr.trim()) {
          pageTexts.push(pageStr.trim());
        }
      } catch (pageErr) {
        console.warn(`[PDF Import] Page ${i} extract warning:`, pageErr.message);
      }
    }

    extracted = pageTexts.join('\n\n').trim();
    if (extracted.length >= 15) {
      return { text: extracted, isPasswordProtected: false };
    }
  } catch (err) {
    const errMsg = (err.message || '').toLowerCase();
    if (errMsg.includes('password') || errMsg.includes('encrypted') || err.name === 'PasswordException') {
      return { text: '', isPasswordProtected: true };
    }
    console.warn('[PDF Import] pdfjs-dist failed, attempting fallbacks:', err.message);
  }

  // Strategy 3: pdf-lib normalize/rebuild + pdfParse
  try {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const rebuiltBuffer = Buffer.from(await pdfDoc.save());
    const data = await pdfParse(rebuiltBuffer);
    if (data && data.text && data.text.trim().length >= 15) {
      return { text: data.text.trim(), isPasswordProtected: false };
    }
  } catch (err) {
    const errMsg = (err.message || '').toLowerCase();
    if (errMsg.includes('password') || errMsg.includes('encrypted')) {
      return { text: '', isPasswordProtected: true };
    }
  }

  // Strategy 4: Raw text streams fallback
  try {
    const rawStr = buffer.toString('latin1');
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match;
    const textPieces = [];
    while ((match = streamRegex.exec(rawStr)) !== null) {
      const streamContent = match[1];
      const textMatches = streamContent.match(/\(([^()]{2,})\)\s*T[jJ]/g);
      if (textMatches) {
        for (const tm of textMatches) {
          const inner = tm.replace(/^\(|\)\s*T[jJ]$/g, '').trim();
          if (inner && inner.length > 1) {
            textPieces.push(inner);
          }
        }
      }
    }
    if (textPieces.length > 5) {
      const rawExtracted = textPieces.join(' ').replace(/\\([()\\])/g, '$1').trim();
      if (rawExtracted.length >= 15) {
        return { text: rawExtracted, isPasswordProtected: false };
      }
    }
  } catch (rawErr) {
    console.warn('[PDF Import] Raw stream extraction notice:', rawErr.message);
  }

  return { text: extracted || '', isPasswordProtected };
};

export const uploadResume = async (req, res) => {
  let uploadedFile = null;
  if (req.file) {
    uploadedFile = req.file;
  } else if (Array.isArray(req.files) && req.files.length > 0) {
    uploadedFile =
      req.files.find(f => f.fieldname === 'resume') ||
      req.files.find(f => f.fieldname === 'file') ||
      req.files[0];
  } else if (req.files && typeof req.files === 'object') {
    uploadedFile =
      (req.files.resume && req.files.resume[0]) ||
      (req.files.file && req.files.file[0]) ||
      Object.values(req.files).flat()[0];
  }

  if (!uploadedFile || !uploadedFile.buffer) {
    return res.status(400).json({ message: 'No file uploaded. Please select a PDF file.' });
  }

  // Validate mimetype/extension
  const isPdf =
    (uploadedFile.mimetype && uploadedFile.mimetype.toLowerCase().includes('pdf')) ||
    (uploadedFile.originalname && uploadedFile.originalname.toLowerCase().endsWith('.pdf'));
  if (!isPdf) {
    return res.status(400).json({ message: 'Only PDF files are supported. Please upload a valid PDF.' });
  }

  // Validate size (5 MB max) — mirrors the frontend dropzone limit.
  const MAX_SIZE = 5 * 1024 * 1024;
  if (uploadedFile.size && uploadedFile.size > MAX_SIZE) {
    return res.status(400).json({ message: 'File is too large. Maximum size is 5MB.' });
  }

  try {
    const { text, isPasswordProtected } = await extractPdfText(uploadedFile.buffer);

    if (isPasswordProtected) {
      return res.status(400).json({
        message: 'This PDF is password-protected or encrypted. Please remove password protection and try again.'
      });
    }

    // Clean extracted text
    const cleanedText = text ? text.trim() : '';

    if (!cleanedText || cleanedText.length < 15) {
      return res.status(400).json({
        message: 'Could not extract readable text from this PDF. Please ensure it is not an empty or image-only/scanned PDF.'
      });
    }

    // 1. Persist the uploaded PDF to MongoDB GridFS (Primary Storage)
    const ownerId = req.user?._id || req.user?.id || 'anonymous';
    let gridFsResult = null;
    try {
      gridFsResult = await uploadToGridFS(uploadedFile.buffer, uploadedFile.originalname, {
        userId: ownerId,
        originalName: uploadedFile.originalname
      });
    } catch (gridErr) {
      console.warn('[PDF Import] GridFS upload notice:', gridErr.message);
    }

    // 2. Persist to local disk as fallback (Dual Storage)
    let storedFile = null;
    try {
      storedFile = persistUploadedPdf(uploadedFile.buffer, ownerId, uploadedFile.originalname);
    } catch (storeErr) {
      console.warn('Failed to persist uploaded PDF to disk:', storeErr.message);
    }

    const fileId = gridFsResult?.fileId || null;
    const safeFilename = uploadedFile.originalname || 'resume.pdf';
    const originalFile = {
      filename: safeFilename,
      fileId: fileId,
      path: storedFile?.relPath || '',
      size: uploadedFile.size || uploadedFile.buffer.length
    };

    // Extract structured data from resume text using local extraction engine
    let analysis;
    try {
      analysis = analyzeResumeTextLocally(cleanedText, 'Software Engineer');
    } catch (localErr) {
      console.warn('Local analyzer notice, using default layout:', localErr.message);
      analysis = {
        improvedResume: {
          contactInfo: { fullName: '', email: '', phone: '', linkedin: '', github: '', portfolio: '', address: '' },
          summary: cleanedText.slice(0, 300),
          skills: [],
          experience: [],
          projects: [],
          education: [],
          certifications: [],
          achievements: []
        }
      };
    }
    const improvedResume = analysis.improvedResume || {};

    res.json({
      originalText: cleanedText,
      extractedText: cleanedText,
      filename: originalFile.filename,
      originalFilename: originalFile.filename,
      size: originalFile.size,
      fileId: fileId,
      originalFile,
      filePath: originalFile.path,
      extractedData: improvedResume,
      improvedResume
    });
  } catch (error) {
    console.error('Upload Resume Error:', error);
    res.status(500).json({ message: 'Failed to extract text from PDF: ' + (error.message || 'Unknown error') });
  }
};

export const analyzeResume = async (req, res) => {
  const { originalText, extractedText, jobRole, targetRole, filename, size, originalFile, fileId } = req.body;

  const chosenText = originalText || extractedText;
  const chosenRole = jobRole || targetRole;

  if (!chosenText || !chosenRole) {
    return res.status(400).json({ message: 'Original text and target job role are required' });
  }

  try {
    let analysis;
    try {
      analysis = await analyzeResumeText(chosenText, chosenRole);
    } catch (aiErr) {
      console.warn('AI analysis failed, using local analyzer fallback:', aiErr.message);
      analysis = analyzeResumeTextLocally(chosenText, chosenRole);
    }

    const userId = req.user?._id || req.user?.id || new mongoose.Types.ObjectId();
    const chosenFileId = fileId || originalFile?.fileId || null;
    const chosenFilename = originalFile?.filename || filename || 'resume.pdf';

    const resumePayload = {
      userId,
      fileId: chosenFileId,
      filename: chosenFilename,
      originalFilename: chosenFilename,
      originalFile: {
        filename: chosenFilename,
        fileId: chosenFileId,
        path: originalFile?.path || '',
        size: originalFile?.size || size || chosenText.length
      },
      originalText: chosenText,
      extractedText: chosenText,
      jobRole: chosenRole,
      targetRole: chosenRole,
      atsScore: analysis.atsScore || analysis.overallATS || 70,
      analysis,
      feedback: {
        honestRoast: analysis.honestRoast || 'No roast available.',
        missingKeywords: analysis.missingKeywords || [],
        grammarMistakes: analysis.grammarMistakes || [],
        resumeStructure: '',
        skillsFeedback: '',
        projectFeedback: '',
        experienceFeedback: '',
        educationFeedback: '',
        sectionSuggestions: {
          summary: '',
          skills: '',
          experience: '',
          projects: '',
          education: ''
        },
        finalRecommendation: analysis.summary || ''
      },
      improvedResume: analysis.improvedResume || {
        summary: '',
        skills: [],
        experience: [],
        projects: [],
        education: [],
        achievements: [],
        certifications: []
      }
    };

    let resume;
    try {
      resume = await Resume.create(resumePayload);
      try {
        await ResumeHistory.create({
          resumeId: resume._id,
          versionNumber: 1,
          improvedResume: resume.improvedResume,
          atsScore: resume.atsScore
        });
      } catch (histErr) {
        console.warn('ResumeHistory creation warning:', histErr.message);
      }
    } catch (dbErr) {
      console.warn('Resume DB storage warning, returning memory object:', dbErr.message);
      resume = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...resumePayload,
        createdAt: new Date().toISOString()
      };
    }

    res.status(201).json(resume);
  } catch (error) {
    console.error('Analyze Resume Error:', error);
    res.status(500).json({ message: error.message || 'Failed to analyze resume' });
  }
};

export const rewriteSection = async (req, res) => {
  const { resumeId, sectionName, instruction } = req.body;

  if (!resumeId || !sectionName || !instruction) {
    return res.status(400).json({ message: 'resumeId, sectionName, and instruction are required' });
  }

  try {
    if (!mongoose.isValidObjectId(resumeId)) {
      return res.status(400).json({ message: 'Invalid resume ID' });
    }
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const updatedImprovedResume = await rewriteResumeSection(
      resume.improvedResume,
      sectionName,
      instruction
    );

    resume.improvedResume = updatedImprovedResume;
    await resume.save();

    const historyCount = await ResumeHistory.countDocuments({ resumeId });

    const newHistory = await ResumeHistory.create({
      resumeId: resume._id,
      versionNumber: historyCount + 1,
      improvedResume: resume.improvedResume,
      atsScore: resume.atsScore
    });

    res.json({
      resume,
      newHistoryVersion: newHistory
    });
  } catch (error) {
    console.error('Rewrite Section Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const rewriteEntire = async (req, res) => {
  const { resumeId } = req.body;

  if (!resumeId) {
    return res.status(400).json({ message: 'resumeId is required' });
  }

  try {
    if (!mongoose.isValidObjectId(resumeId)) {
      return res.status(400).json({ message: 'Invalid resume ID' });
    }
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const updatedImprovedResume = await rewriteEntireResume(resume.improvedResume, resume.jobRole);

    resume.improvedResume = updatedImprovedResume;
    await resume.save();

    const historyCount = await ResumeHistory.countDocuments({ resumeId });

    const newHistory = await ResumeHistory.create({
      resumeId: resume._id,
      versionNumber: historyCount + 1,
      improvedResume: resume.improvedResume,
      atsScore: resume.atsScore
    });

    res.json({
      resume,
      newHistoryVersion: newHistory
    });
  } catch (error) {
    console.error('Rewrite Entire Resume Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getResumeHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ updatedAt: -1, createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Returns the most recently updated resume for the authenticated user (used by the builder).
export const getLatestResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id }).sort({ updatedAt: -1, createdAt: -1 });
    if (!resume) {
      return res.status(404).json({ message: 'No resume found' });
    }
    res.json({ resume });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Streams the original uploaded PDF for a resume owned by the authenticated user (GridFS + disk fallback).
export const getResumeFile = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found or access denied' });
    }

    const downloadName = resume.originalFilename || resume.originalFile?.filename || 'resume.pdf';
    const safeDownloadName = sanitizeFilename(downloadName);

    // 1. GridFS Storage (Primary)
    const fileId = resume.fileId || resume.originalFile?.fileId;
    if (fileId) {
      const exists = await checkGridFSFileExists(fileId);
      if (exists) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${safeDownloadName}"`);
        return downloadFromGridFS(fileId).pipe(res);
      }
    }

    // 2. Local disk storage (Fallback)
    if (resume.originalFile?.path) {
      const absPath = resolveStoredPath(resume.originalFile.path);
      if (absPath && fs.existsSync(absPath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${safeDownloadName}"`);
        return fs.createReadStream(absPath).pipe(res);
      }
    }

    // 3. Dynamic generation fallback
    if (resume.improvedResume) {
      const user = await User.findById(req.user._id).catch(() => null);
      const pdfBuffer = generateResumePDF(resume.improvedResume, user, resume.selectedTemplate || 'classic');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${safeDownloadName}"`);
      return res.send(pdfBuffer);
    }

    return res.status(404).json({ message: 'Original file is no longer available on the server' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const history = await ResumeHistory.find({ resumeId: resume._id }).sort({ versionNumber: -1 });

    res.json({
      resume,
      history
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Authenticated save endpoint supporting multipart file or JSON metadata
export const saveResume = async (req, res) => {
  try {
    let uploadedBuffer = null;
    let originalName = 'resume.pdf';
    let uploadedFile = null;

    if (req.file) {
      uploadedFile = req.file;
    } else if (Array.isArray(req.files) && req.files.length > 0) {
      uploadedFile =
        req.files.find(f => f.fieldname === 'resume') ||
        req.files.find(f => f.fieldname === 'file') ||
        req.files[0];
    } else if (req.files && typeof req.files === 'object') {
      uploadedFile =
        (req.files.resume && req.files.resume[0]) ||
        (req.files.file && req.files.file[0]) ||
        Object.values(req.files).flat()[0];
    }

    if (uploadedFile && uploadedFile.buffer) {
      uploadedBuffer = uploadedFile.buffer;
      originalName = uploadedFile.originalname || 'resume.pdf';
    }

    const {
      resumeId,
      originalText,
      extractedText,
      jobRole,
      targetRole,
      atsScore,
      improvedResume,
      resumeData,
      selectedTemplate,
      analysis: bodyAnalysis,
      feedback: bodyFeedback,
      fileId: bodyFileId
    } = req.body;

    let fileId = bodyFileId;
    let relPath = '';

    if (uploadedBuffer) {
      try {
        const gridRes = await uploadToGridFS(uploadedBuffer, originalName, { userId: req.user._id });
        fileId = gridRes.fileId;
      } catch (gridErr) {
        console.warn('[saveResume] GridFS notice:', gridErr.message);
      }
      try {
        const diskRes = persistUploadedPdf(uploadedBuffer, req.user._id, originalName);
        relPath = diskRes.relPath;
      } catch (diskErr) {
        console.warn('[saveResume] Disk notice:', diskErr.message);
      }
    }

    let resume = null;
    if (resumeId) {
      if (!mongoose.isValidObjectId(resumeId)) {
        return res.status(400).json({ message: 'Invalid resume ID' });
      }
      resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }
    }

    const finalData = improvedResume || resumeData || (resume ? resume.improvedResume : {});
    const finalRole = jobRole || targetRole || (resume ? resume.jobRole : 'Software Engineer');
    const finalText = originalText || extractedText || (resume ? resume.originalText : 'Created via Resume Builder');
    const finalScore = typeof atsScore === 'number' ? atsScore : (resume ? resume.atsScore : 75);

    if (!resume) {
      resume = new Resume({
        userId: req.user._id,
        fileId: fileId || null,
        filename: originalName,
        originalFilename: originalName,
        originalFile: {
          filename: originalName,
          path: relPath,
          size: uploadedBuffer ? uploadedBuffer.length : 0,
          fileId: fileId || null
        },
        originalText: finalText,
        extractedText: finalText,
        jobRole: finalRole,
        targetRole: finalRole,
        atsScore: finalScore,
        analysis: bodyAnalysis || {},
        feedback: bodyFeedback || {},
        improvedResume: finalData,
        selectedTemplate: selectedTemplate || 'classic'
      });
    } else {
      if (fileId) {
        resume.fileId = fileId;
        if (!resume.originalFile) resume.originalFile = {};
        resume.originalFile.fileId = fileId;
      }
      if (relPath) {
        if (!resume.originalFile) resume.originalFile = {};
        resume.originalFile.path = relPath;
      }
      if (finalData) resume.improvedResume = finalData;
      if (finalRole) {
        resume.jobRole = finalRole;
        resume.targetRole = finalRole;
      }
      if (finalText) {
        resume.originalText = finalText;
        resume.extractedText = finalText;
      }
      if (typeof atsScore === 'number') resume.atsScore = atsScore;
      if (selectedTemplate) resume.selectedTemplate = selectedTemplate;
      if (bodyAnalysis) resume.analysis = bodyAnalysis;
      if (bodyFeedback) resume.feedback = bodyFeedback;
    }

    await resume.save();

    const historyCount = await ResumeHistory.countDocuments({ resumeId: resume._id });
    await ResumeHistory.create({
      resumeId: resume._id,
      versionNumber: historyCount + 1,
      improvedResume: resume.improvedResume,
      atsScore: resume.atsScore
    });

    return res.status(resumeId ? 200 : 201).json(resume);
  } catch (err) {
    console.error('Save Resume Error:', err);
    return res.status(500).json({ message: err.message || 'Failed to save resume' });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    await ResumeHistory.deleteMany({ resumeId: req.params.id });

    // Delete from GridFS if present
    const fileId = resume.fileId || resume.originalFile?.fileId;
    if (fileId) {
      await deleteFromGridFS(fileId);
    }

    // Best-effort removal of the stored PDF from local disk.
    if (resume.originalFile?.path) {
      try {
        const absPath = resolveStoredPath(resume.originalFile.path);
        if (absPath && fs.existsSync(absPath)) {
          fs.unlinkSync(absPath);
        }
      } catch (fileErr) {
        console.warn('Failed to delete stored PDF from disk:', fileErr.message);
      }
    }

    res.json({ success: true, message: 'Resume and PDF deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadResumePDF = async (req, res) => {
  const { resumeId, selectedTemplate, template: bodyTemplate, improvedResume, resumeData, jobRole: bodyJobRole } = req.body;

  try {
    let resumeDataToExport = improvedResume || resumeData;
    let targetJobRole = bodyJobRole || 'Resume';
    let template = selectedTemplate || bodyTemplate || 'classic';
    let user = req.user ? await User.findById(req.user._id).catch(() => null) : null;


    if (resumeId && typeof resumeId === 'string' && mongoose.isValidObjectId(resumeId)) {
      try {
        const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
        if (resume) {
          resumeDataToExport = resumeDataToExport || resume.improvedResume;
          targetJobRole = resume.jobRole || targetJobRole;
          if (!selectedTemplate && !bodyTemplate && resume.selectedTemplate) {
            template = resume.selectedTemplate;
          }
          if (!user && resume.userId) {
            user = await User.findById(resume.userId).catch(() => null);
          }
        }
      } catch (dbErr) {
        console.warn('MongoDB resume lookup skipped for PDF export:', dbErr.message);
      }
    }

    if (!resumeDataToExport) {
      return res.status(404).json({ message: 'Resume data not found for export' });
    }

    const pdfBuffer = generateResumePDF(resumeDataToExport, user, template);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Resume_${targetJobRole.replace(/\s+/g, '_')}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download PDF Error:', error);
    res.status(500).json({ message: 'Failed to generate PDF: ' + error.message });
  }
};

export const updateResumeData = async (req, res) => {
  const { resumeId, improvedResume, selectedTemplate, jobRole, atsScore } = req.body;

  try {
    let resume = null;
    if (resumeId) {
      if (!mongoose.isValidObjectId(resumeId)) {
        return res.status(400).json({ message: 'Invalid resume ID' });
      }
      resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }
    }

    if (!resume) {
      resume = new Resume({
        userId: req.user._id,
        originalFile: { filename: 'builder_resume.pdf', path: '', size: 0 },
        originalText: 'Created via Resume Builder',
        jobRole: jobRole || 'Software Engineer',
        atsScore: typeof atsScore === 'number' ? atsScore : 85,
        analysis: {},
        improvedResume: improvedResume || {},
        selectedTemplate: selectedTemplate || 'classic'
      });
    } else {
      if (improvedResume) resume.improvedResume = improvedResume;
      if (selectedTemplate) resume.selectedTemplate = selectedTemplate;
      if (jobRole) resume.jobRole = jobRole;
      if (typeof atsScore === 'number') resume.atsScore = atsScore;
    }

    await resume.save();

    // Only create a new revision when the content actually changed so that
    // autosave does not generate revision spam.
    const lastHistory = await ResumeHistory.findOne({ resumeId: resume._id }).sort({ versionNumber: -1 });
    const currentJson = JSON.stringify(resume.improvedResume || {});
    const lastJson = lastHistory ? JSON.stringify(lastHistory.improvedResume || {}) : null;

    if (lastJson !== currentJson) {
      const historyCount = await ResumeHistory.countDocuments({ resumeId: resume._id });
      await ResumeHistory.create({
        resumeId: resume._id,
        versionNumber: historyCount + 1,
        improvedResume: resume.improvedResume,
        atsScore: resume.atsScore
      });
    }

    res.json(resume);
  } catch (error) {
    console.error('Update Resume Data Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const performSectionAIAction = async (req, res) => {
  const { resumeId, sectionName, actionType, content, jobRole: bodyJobRole, context = {}, jobDescription } = req.body;

  if (!sectionName || !actionType) {
    return res.status(400).json({ message: 'sectionName and actionType are required' });
  }

  try {
    let jobRole = bodyJobRole || '';
    let enrichedContext = (context && typeof context === 'object') ? { ...context } : {};
    if (jobDescription && !enrichedContext.jobDescription) {
      enrichedContext.jobDescription = jobDescription;
    }

    if (resumeId && typeof resumeId === 'string' && mongoose.isValidObjectId(resumeId)) {
      try {
        const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
        if (resume) {
          if (!jobRole) jobRole = resume.jobRole;
          const imp = resume.improvedResume || {};
          if (!enrichedContext.skills && (imp.skills || resume.skills)) {
            enrichedContext.skills = imp.skills || resume.skills;
          }
          if (!enrichedContext.experience && (imp.experience || resume.experience)) {
            enrichedContext.experience = imp.experience || resume.experience;
          }
          if (!enrichedContext.projects && (imp.projects || resume.projects)) {
            enrichedContext.projects = imp.projects || resume.projects;
          }
          if (!enrichedContext.education && (imp.education || resume.education)) {
            enrichedContext.education = imp.education || resume.education;
          }
          if (!enrichedContext.certifications && (imp.certifications || resume.certifications)) {
            enrichedContext.certifications = imp.certifications || resume.certifications;
          }
          if (!enrichedContext.achievements && (imp.achievements || resume.achievements)) {
            enrichedContext.achievements = imp.achievements || resume.achievements;
          }
        }
      } catch (dbErr) {
        console.warn('Optional MongoDB resume enrichment skipped:', dbErr.message);
      }
    }

    const updatedContent = await executeSectionAIAction(sectionName, actionType, content, jobRole, enrichedContext);
    return res.json({ updatedContent });
  } catch (error) {
    console.error('Section AI Action Controller Error:', error);
    const fallback = typeof content === 'string' && content.trim()
      ? content
      : 'Results-driven professional with demonstrated technical strengths.';
    return res.json({ updatedContent: fallback, warning: error.message });
  }
};

export const downloadResumeDOCX = async (req, res) => {
  const { resumeId, improvedResume, resumeData, selectedTemplate, template: bodyTemplate } = req.body;

  try {
    let resumeDataToExport = improvedResume || resumeData;
    let targetJobRole = 'Resume';
    let template = selectedTemplate || bodyTemplate || 'classic';


    if (resumeId && typeof resumeId === 'string' && mongoose.isValidObjectId(resumeId)) {
      try {
        const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
        if (resume) {
          resumeDataToExport = resumeDataToExport || resume.improvedResume;
          targetJobRole = resume.jobRole || targetJobRole;
          if (!selectedTemplate && !bodyTemplate && resume.selectedTemplate) {
            template = resume.selectedTemplate;
          }
        }
      } catch (dbErr) {
        console.warn('MongoDB resume lookup skipped for DOCX export:', dbErr.message);
      }
    }

    if (!resumeDataToExport) {
      return res.status(404).json({ message: 'Resume data not found for export' });
    }

    const user = req.user ? await User.findById(req.user._id).catch(() => null) : null;
    const docxBuffer = await generateResumeDOCX(resumeDataToExport, user, template);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=Resume_${targetJobRole.replace(/\s+/g, '_')}.docx`);
    res.send(docxBuffer);
  } catch (error) {
    console.error('Download DOCX Error:', error);
    res.status(500).json({ message: 'Failed to generate DOCX: ' + error.message });
  }
};

