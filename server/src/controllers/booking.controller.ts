import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { CreateBookingDto } from '../models/booking.model';

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { property_id, check_in, check_out, message }: CreateBookingDto = req.body;

    if (!property_id || !check_in || !check_out) {
      res.status(400).json({ message: 'Required fields missing' });
      return;
    }

    // Check if property exists and is available
    const property = await query(
      'SELECT * FROM properties WHERE id = $1 AND is_available = true',
      [property_id]
    );

    if (property.rows.length === 0) {
      res.status(404).json({ message: 'Property not found or not available' });
      return;
    }

    // Check for overlapping bookings
    const overlap = await query(
      `SELECT id FROM bookings 
       WHERE property_id = $1 
       AND status NOT IN ('cancelled')
       AND (check_in, check_out) OVERLAPS ($2::date, $3::date)`,
      [property_id, check_in, check_out]
    );

    if (overlap.rows.length > 0) {
      res.status(409).json({ message: 'Property is already booked for these dates' });
      return;
    }

    // Calculate total price
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const total_price = nights * parseFloat(property.rows[0].price);

    const result = await query(
      `INSERT INTO bookings (property_id, renter_id, check_in, check_out, total_price, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [property_id, req.userId, check_in, check_out, total_price, message]
    );

    res.status(201).json({ message: 'Booking created', booking: result.rows[0] });
  } catch (error) {
    console.error('CreateBooking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT b.*, p.title as property_title, p.city, p.country, p.images,
              u.full_name as owner_name
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       JOIN users u ON p.owner_id = u.id
       WHERE b.renter_id = $1
       ORDER BY b.created_at DESC`,
      [req.userId]
    );

    res.json({ bookings: result.rows });
  } catch (error) {
    console.error('GetMyBookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOwnerBookings = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT b.*, p.title as property_title, p.city, 
              u.full_name as renter_name, u.email as renter_email
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       JOIN users u ON b.renter_id = u.id
       WHERE p.owner_id = $1
       ORDER BY b.created_at DESC`,
      [req.userId]
    );
    res.json({ bookings: result.rows });
  } catch (error) {
    console.error('GetOwnerBookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPropertyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const property = await query(
      'SELECT owner_id FROM properties WHERE id = $1',
      [id]
    );

    if (property.rows.length === 0) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    if (property.rows[0].owner_id !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const result = await query(
      `SELECT b.*, u.full_name as renter_name, u.email as renter_email
       FROM bookings b
       JOIN users u ON b.renter_id = u.id
       WHERE b.property_id = $1
       ORDER BY b.created_at DESC`,
      [id]
    );

    res.json({ bookings: result.rows });
  } catch (error) {
    console.error('GetPropertyBookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const booking = await query(
      `SELECT b.*, p.owner_id FROM bookings b
       JOIN properties p ON b.property_id = p.id
       WHERE b.id = $1`,
      [id]
    );

    if (booking.rows.length === 0) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    const isOwner = booking.rows[0].owner_id === req.userId;
    const isRenter = booking.rows[0].renter_id === req.userId;

    if (!isOwner && !isRenter && req.userRole !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const result = await query(
      `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );

    res.json({ message: 'Booking updated', booking: result.rows[0] });
  } catch (error) {
    console.error('UpdateBookingStatus error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};