import express from 'express';
import { getConversation, getGroupMessages, sendMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:userId', protect, getConversation);
router.get('/group/:groupId', protect, getGroupMessages);
router.post('/', protect, sendMessage);

export default router;
