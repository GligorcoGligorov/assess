import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { CreateMessageDto } from '../models/message.model';
import { io } from '../index';

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { receiver_id, property_id, content }: CreateMessageDto = req.body;

    if (!receiver_id || !property_id || !content) {
      res.status(400).json({ message: 'Required fields missing' });
      return;
    }

    // Generate consistent room_id
    const ids = [req.userId, receiver_id].sort();
    const room_id = `${ids[0]}_${ids[1]}_${property_id}`;

    const result = await query(
      `INSERT INTO messages (room_id, sender_id, receiver_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [room_id, req.userId, receiver_id, content]
    );

    const message = result.rows[0];

    // Emit real-time event
    io.to(room_id).emit('receive_message', message);

    res.status(201).json({ message: 'Message sent', data: message });
  } catch (error) {
    console.error('SendMessage error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { receiver_id, property_id } = req.query as {
      receiver_id: string;
      property_id: string;
    };

    if (!receiver_id || !property_id) {
      res.status(400).json({ message: 'receiver_id and property_id are required' });
      return;
    }

    const ids = [req.userId, receiver_id].sort();
    const room_id = `${ids[0]}_${ids[1]}_${property_id}`;

    const result = await query(
      `SELECT m.*, u.full_name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.room_id = $1
       ORDER BY m.created_at ASC`,
      [room_id]
    );

    // Mark messages as read
    await query(
      `UPDATE messages SET is_read = true 
       WHERE room_id = $1 AND receiver_id = $2 AND is_read = false`,
      [room_id, req.userId]
    );

    res.json({ messages: result.rows, room_id });
  } catch (error) {
    console.error('GetMessages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT DISTINCT ON (m.room_id) m.*, 
              u.full_name as other_user_name,
              p.title as property_title,
              COUNT(unread.id) OVER (PARTITION BY m.room_id) as unread_count
       FROM messages m
       JOIN users u ON (
         CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END = u.id
       )
       LEFT JOIN properties p ON m.room_id LIKE '%' || p.id || '%'
       LEFT JOIN messages unread ON unread.room_id = m.room_id 
         AND unread.receiver_id = $1 AND unread.is_read = false
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY m.room_id, m.created_at DESC`,
      [req.userId]
    );

    res.json({ conversations: result.rows });
  } catch (error) {
    console.error('GetConversations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};