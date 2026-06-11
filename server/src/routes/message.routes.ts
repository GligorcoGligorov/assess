import { Router } from 'express';
import {
  sendMessage,
  getMessages,
  getConversations,
} from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, sendMessage);
router.get('/', authenticate, getMessages);
router.get('/conversations', authenticate, getConversations);

export default router;