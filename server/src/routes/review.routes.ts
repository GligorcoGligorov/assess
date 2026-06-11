import { Router } from 'express';
import { createReview, getPropertyReviews } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/:property_id', authenticate, createReview);
router.get('/:property_id', getPropertyReviews);

export default router;