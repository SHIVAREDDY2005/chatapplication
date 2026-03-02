import express from 'express';
import { createGroup, getMyGroups } from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMyGroups);
router.post('/', protect, createGroup);

export default router;
