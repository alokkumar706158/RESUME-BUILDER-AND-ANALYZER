import express from 'express';
import multer from 'multer';
import {
  uploadResume,
  analyzeResume,
  rewriteSection,
  rewriteEntire,
  getResumeHistory,
  getLatestResume,
  getResumeById,
  getResumeFile,
  deleteResume,
  downloadResumePDF,
  updateResumeData,
  performSectionAIAction,
  downloadResumeDOCX,
  saveResume
} from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Multer memory storage: the PDF is parsed in memory, then persisted to disk
// inside the controller with a safe, unique filename (per-user folder).
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5MB max, up to 5 files to handle multiple form fields safely
  fileFilter: (req, file, cb) => {
    const isPdf =
      (file.mimetype && file.mimetype.toLowerCase() === 'application/pdf') ||
      (file.originalname && file.originalname.toLowerCase().endsWith('.pdf'));
    if (!isPdf) {
      return cb(new Error('Only PDF files are supported. Please upload a valid PDF.'));
    }
    return cb(null, true);
  }
});

// Authenticated save/list/get/download/delete routes
router.post('/save', protect, upload.any(), saveResume);
router.post('/upload', protect, upload.any(), uploadResume);
router.post('/analyze', protect, analyzeResume);
router.post('/rewrite', protect, rewriteSection);
router.post('/rewrite-all', protect, rewriteEntire);
router.post('/ai-action', protect, performSectionAIAction);
router.get('/history', protect, getResumeHistory);
router.get('/latest', protect, getLatestResume);
router.get('/', protect, getResumeHistory);
router.post('/', protect, upload.any(), saveResume);
router.post('/download', protect, downloadResumePDF);
router.post('/download-docx', protect, downloadResumeDOCX);
router.put('/update', protect, updateResumeData);
router.get('/:id/file', protect, getResumeFile);
router.get('/:id/download', protect, getResumeFile);
router.get('/:id', protect, getResumeById);
router.delete('/:id', protect, deleteResume);

export default router;
