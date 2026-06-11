import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getPropertyBookings,
  updateBookingStatus,
  getOwnerBookings
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createBooking);
router.get('/my', authenticate, getMyBookings);
router.get('/property/:id', authenticate, getPropertyBookings);
router.patch('/:id/status', authenticate, updateBookingStatus);
router.get('/my-properties', authenticate, getOwnerBookings);
export default router;