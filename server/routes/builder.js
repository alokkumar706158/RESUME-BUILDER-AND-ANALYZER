import express from 'express';
import {
  createBuilderResume,
  updateBuilderResume,
  getBuilderResume,
  getLatestBuilderResume
} from '../controllers/builderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createBuilderResume);
router.get('/latest', getLatestBuilderResume);
router.get('/:id', getBuilderResume);
router.put('/:id', updateBuilderResume);

export default router;
