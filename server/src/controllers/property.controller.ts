import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { CreatePropertyDto, PropertyFilters } from '../models/property.model';

export const getProperties = async (req: AuthRequest, res: Response) => {
  try {
    const { city, country, type, minPrice, maxPrice, bedrooms, is_available, page = '1', limit = '10' }: PropertyFilters & { page?: string; limit?: string } = req.query as any;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let sql = `
      SELECT p.*, u.full_name as owner_name, u.email as owner_email
      FROM properties p
      JOIN users u ON p.owner_id = u.id
      WHERE 1=1
    `;
    let countSql = `SELECT COUNT(*) FROM properties p WHERE 1=1`;
    const params: unknown[] = [];
    const countParams: unknown[] = [];
    let paramCount = 1;

    if (city) {
      sql += ` AND LOWER(p.city) LIKE LOWER($${paramCount})`;
      countSql += ` AND LOWER(p.city) LIKE LOWER($${paramCount})`;
      params.push(`%${city}%`);
      countParams.push(`%${city}%`);
      paramCount++;
    }
    if (country) {
      sql += ` AND LOWER(p.country) LIKE LOWER($${paramCount})`;
      countSql += ` AND LOWER(p.country) LIKE LOWER($${paramCount})`;
      params.push(`%${country}%`);
      countParams.push(`%${country}%`);
      paramCount++;
    }
    if (type) {
      sql += ` AND p.type = $${paramCount}`;
      countSql += ` AND p.type = $${paramCount}`;
      params.push(type);
      countParams.push(type);
      paramCount++;
    }
    if (minPrice) {
      sql += ` AND p.price >= $${paramCount}`;
      countSql += ` AND p.price >= $${paramCount}`;
      params.push(minPrice);
      countParams.push(minPrice);
      paramCount++;
    }
    if (maxPrice) {
      sql += ` AND p.price <= $${paramCount}`;
      countSql += ` AND p.price <= $${paramCount}`;
      params.push(maxPrice);
      countParams.push(maxPrice);
      paramCount++;
    }
    if (bedrooms) {
      sql += ` AND p.bedrooms = $${paramCount}`;
      countSql += ` AND p.bedrooms = $${paramCount}`;
      params.push(bedrooms);
      countParams.push(bedrooms);
      paramCount++;
    }
    if (is_available !== undefined) {
      sql += ` AND p.is_available = $${paramCount}`;
      countSql += ` AND p.is_available = $${paramCount}`;
      params.push(is_available);
      countParams.push(is_available);
      paramCount++;
    }

    sql += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limitNum, offset);

    const [result, countResult] = await Promise.all([
      query(sql, params),
      query(countSql, countParams),
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      properties: result.rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('GetProperties error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPropertyById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT p.*, u.full_name as owner_name, u.email as owner_email, u.phone as owner_phone
       FROM properties p
       JOIN users u ON p.owner_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    res.json({ property: result.rows[0] });
  } catch (error) {
    console.error('GetPropertyById error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createProperty = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title, description, price, location, city, country,
      type, bedrooms = 1, bathrooms = 1, area, images = [], amenities = []
    }: CreatePropertyDto = req.body;

    if (!title || !price || !location || !city || !country || !type) {
      res.status(400).json({ message: 'Required fields missing' });
      return;
    }

    const result = await query(
      `INSERT INTO properties 
        (owner_id, title, description, price, location, city, country, type, bedrooms, bathrooms, area, images, amenities)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [req.userId, title, description, price, location, city, country, type, bedrooms, bathrooms, area, images, amenities]
    );

    res.status(201).json({ message: 'Property created', property: result.rows[0] });
  } catch (error) {
    console.error('CreateProperty error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await query(
      'SELECT owner_id FROM properties WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    if (existing.rows[0].owner_id !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const fields = req.body;
    const updates: string[] = [];
    const params: unknown[] = [];
    let paramCount = 1;

    Object.keys(fields).forEach((key) => {
      updates.push(`${key} = $${paramCount++}`);
      params.push(fields[key]);
    });

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const result = await query(
      `UPDATE properties SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );

    res.json({ message: 'Property updated', property: result.rows[0] });
  } catch (error) {
    console.error('UpdateProperty error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await query(
      'SELECT owner_id FROM properties WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    if (existing.rows[0].owner_id !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    await query('DELETE FROM properties WHERE id = $1', [id]);
    res.json({ message: 'Property deleted' });
  } catch (error) {
    console.error('DeleteProperty error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};