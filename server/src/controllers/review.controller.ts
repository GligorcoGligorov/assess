import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { property_id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: 'Rating must be between 1 and 5' });
      return;
    }

    // Check if user has a completed booking for this property
    const booking = await query(
      `SELECT id FROM bookings 
       WHERE property_id = $1 AND renter_id = $2 AND status = 'completed'`,
      [property_id, req.userId]
    );

    if (booking.rows.length === 0) {
      res.status(403).json({ message: 'You can only review properties you have stayed at' });
      return;
    }

    // Check if already reviewed
    const existing = await query(
      'SELECT id FROM reviews WHERE property_id = $1 AND reviewer_id = $2',
      [property_id, req.userId]
    );

    if (existing.rows.length > 0) {
      res.status(409).json({ message: 'You have already reviewed this property' });
      return;
    }

    const result = await query(
      `INSERT INTO reviews (property_id, reviewer_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [property_id, req.userId, rating, comment]
    );

    res.status(201).json({ message: 'Review created', review: result.rows[0] });
  } catch (error) {
    console.error('CreateReview error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPropertyReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { property_id } = req.params;

    const result = await query(
      `SELECT r.*, u.full_name as reviewer_name, u.avatar_url as reviewer_avatar
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.property_id = $1
       ORDER BY r.created_at DESC`,
      [property_id]
    );

    const avgResult = await query(
      'SELECT AVG(rating)::numeric(10,1) as average_rating, COUNT(*) as total_reviews FROM reviews WHERE property_id = $1',
      [property_id]
    );

    res.json({
      reviews: result.rows,
      average_rating: avgResult.rows[0].average_rating,
      total_reviews: avgResult.rows[0].total_reviews,
    });
  } catch (error) {
    console.error('GetPropertyReviews error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};