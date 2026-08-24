import express from 'express';
import multer from 'multer';
import {
  uploadResume,
  analyzeResume,
  rewriteSection,
  rewriteEntire,
  getResumeHistory,
  getResumeById,
  deleteResume,
  downloadResumePDF,
  updateResumeData,
  performSectionAIAction,
  downloadResumeDOCX
} from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Setup Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max size
});

// Define routes
router.post('/upload', protect, upload.any(), uploadResume);
router.post('/analyze', protect, analyzeResume);
router.post('/rewrite', protect, rewriteSection);
router.post('/rewrite-all', protect, rewriteEntire);
router.post('/ai-action', protect, performSectionAIAction);
router.get('/history', protect, getResumeHistory);
router.post('/download', protect, downloadResumePDF);
router.post('/download-docx', protect, downloadResumeDOCX);
router.put('/update', protect, updateResumeData);
router.get('/:id', protect, getResumeById);
router.delete('/:id', protect, deleteResume);

export default router;
