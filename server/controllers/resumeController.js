import mongoose from 'mongoose';
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

const extractPdfText = async (buffer) => {
  let isPasswordProtected = false;
  let extracted = '';

  // Strategy 1: Modern pdfjs-dist (legacy Node-compatible build)
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

  // Strategy 2: pdf-parse
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
    console.warn('[PDF Import] pdf-parse failed:', err.message);
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
  const uploadedFile =
    req.file ||
    (req.files && req.files[0]) ||
    (req.files && req.files.resume && req.files.resume[0]) ||
    (req.files && req.files.file && req.files.file[0]);

  if (!uploadedFile) {
    return res.status(400).json({ message: 'No file uploaded. Please select a PDF file.' });
  }

  // Validate mimetype/extension
  const isPdf =
    (uploadedFile.mimetype && uploadedFile.mimetype.toLowerCase().includes('pdf')) ||
    (uploadedFile.originalname && uploadedFile.originalname.toLowerCase().endsWith('.pdf'));
  if (!isPdf) {
    return res.status(400).json({ message: 'Only PDF files are supported. Please upload a valid PDF.' });
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
      filename: uploadedFile.originalname || 'resume.pdf',
      size: uploadedFile.size || 0,
      extractedData: improvedResume,
      improvedResume
    });
  } catch (error) {
    console.error('Upload Resume Error:', error);
    res.status(500).json({ message: 'Failed to extract text from PDF: ' + (error.message || 'Unknown error') });
  }
};

export const analyzeResume = async (req, res) => {
  const { originalText, jobRole, filename, size } = req.body;

  if (!originalText || !jobRole) {
    return res.status(400).json({ message: 'Original text and target job role are required' });
  }

  try {
    let analysis;
    try {
      analysis = await analyzeResumeText(originalText, jobRole);
    } catch (aiErr) {
      console.warn('AI analysis failed, using local analyzer fallback:', aiErr.message);
      analysis = analyzeResumeTextLocally(originalText, jobRole);
    }

    const userId = req.user?._id || req.user?.id || new mongoose.Types.ObjectId();
    const resumePayload = {
      userId,
      originalFile: {
        filename: filename || 'resume.pdf',
        path: '',
        size: size || originalText.length
      },
      originalText,
      jobRole,
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
    const resume = await Resume.findById(resumeId);
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
    const resume = await Resume.findById(resumeId);
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
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(resumes);
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

export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    await ResumeHistory.deleteMany({ resumeId: req.params.id });

    res.json({ message: 'Resume and history deleted successfully' });
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
        const resume = await Resume.findById(resumeId);
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
  const { resumeId, improvedResume, selectedTemplate, jobRole } = req.body;

  try {
    let resume = null;
    if (resumeId && typeof resumeId === 'string' && mongoose.isValidObjectId(resumeId)) {
      try {
        resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
      } catch (findErr) {
        console.warn('Resume findOne skipped:', findErr.message);
      }
    }

    if (!resume) {
      const validUserId = req.user && req.user._id && mongoose.isValidObjectId(req.user._id)
        ? req.user._id
        : new mongoose.Types.ObjectId();

      resume = new Resume({
        userId: validUserId,
        originalFile: { filename: 'builder_resume.pdf', path: '', size: 0 },
        originalText: 'Created via Resume Builder',
        jobRole: jobRole || 'Software Engineer',
        atsScore: 85,
        analysis: {},
        improvedResume: improvedResume || {},
        selectedTemplate: selectedTemplate || 'classic'
      });
    } else {
      if (improvedResume) resume.improvedResume = improvedResume;
      if (selectedTemplate) resume.selectedTemplate = selectedTemplate;
      if (jobRole) resume.jobRole = jobRole;
    }

    await resume.save();

    const historyCount = await ResumeHistory.countDocuments({ resumeId: resume._id });
    await ResumeHistory.create({
      resumeId: resume._id,
      versionNumber: historyCount + 1,
      improvedResume: resume.improvedResume,
      atsScore: resume.atsScore
    });

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
        const resume = await Resume.findById(resumeId);
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
        const resume = await Resume.findById(resumeId);
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

