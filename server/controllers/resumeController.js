import pdfParse from 'pdf-parse';
import Resume from '../models/Resume.js';
import ResumeHistory from '../models/ResumeHistory.js';
import User from '../models/User.js';
import { analyzeResumeText, rewriteEntireResume, rewriteResumeSection, executeSectionAIAction } from '../services/gemini.js';
import { generateResumePDF } from '../utils/pdfGenerator.js';
import { generateResumeDOCX } from '../utils/docxGenerator.js';

export const uploadResume = async (req, res) => {
  const uploadedFile = req.file || (req.files && req.files[0]);

  if (!uploadedFile) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    let parsedText = '';
    try {
      const data = await pdfParse(uploadedFile.buffer);
      parsedText = data ? data.text : '';
    } catch (pdfErr) {
      console.warn('pdf-parse failed, using raw buffer string fallback:', pdfErr.message);
    }

    // Fallback if pdfParse produced empty string or threw error
    if (!parsedText || parsedText.trim().length === 0) {
      const rawStr = uploadedFile.buffer.toString('utf8');
      // Clean non-printable bytes
      parsedText = rawStr.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
    }

    res.json({
      originalText: parsedText || 'Extracted resume content',
      filename: uploadedFile.originalname || 'resume.pdf',
      size: uploadedFile.size || 0
    });
  } catch (error) {
    console.error('Upload Resume Error:', error);
    res.status(500).json({ message: 'Failed to parse PDF file: ' + error.message });
  }
};

export const analyzeResume = async (req, res) => {
  const { originalText, jobRole, filename, size } = req.body;

  if (!originalText || !jobRole) {
    return res.status(400).json({ message: 'Original text and target job role are required' });
  }

  try {
    const analysis = await analyzeResumeText(originalText, jobRole);

    const resume = await Resume.create({
      userId: req.user._id,
      originalFile: {
        filename: filename || 'resume.pdf',
        path: '',
        size: size || originalText.length
      },
      originalText,
      jobRole,
      atsScore: analysis.atsScore || 70,
      analysis,
      feedback: {
        honestRoast: analysis.honestRoast || 'No roast available.',
        missingKeywords: [], // deprecated format
        grammarMistakes: [],
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
    });

    await ResumeHistory.create({
      resumeId: resume._id,
      versionNumber: 1,
      improvedResume: resume.improvedResume,
      atsScore: resume.atsScore
    });

    res.status(201).json(resume);
  } catch (error) {
    console.error('Analyze Resume Error:', error);
    res.status(500).json({ message: error.message });
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
  const { resumeId } = req.body;

  try {
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const user = await User.findById(resume.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const pdfBuffer = generateResumePDF(resume.improvedResume, user);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Resume_${resume.jobRole.replace(/\s+/g, '_')}.pdf`);
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
    if (resumeId) {
      resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    }

    if (!resume) {
      resume = new Resume({
        userId: req.user._id,
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
  const { resumeId, sectionName, actionType, content } = req.body;

  if (!sectionName || !actionType) {
    return res.status(400).json({ message: 'sectionName and actionType are required' });
  }

  try {
    let jobRole = '';
    if (resumeId) {
      const resume = await Resume.findById(resumeId);
      if (resume) jobRole = resume.jobRole;
    }

    const updatedContent = await executeSectionAIAction(sectionName, actionType, content, jobRole);
    res.json({ updatedContent });
  } catch (error) {
    console.error('Section AI Action Controller Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const downloadResumeDOCX = async (req, res) => {
  const { resumeId } = req.body;

  try {
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const user = await User.findById(resume.userId);

    const docxBuffer = await generateResumeDOCX(resume.improvedResume, user);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=Resume_${(resume.jobRole || 'Builder').replace(/\s+/g, '_')}.docx`);
    res.send(docxBuffer);
  } catch (error) {
    console.error('Download DOCX Error:', error);
    res.status(500).json({ message: 'Failed to generate DOCX: ' + error.message });
  }
};

