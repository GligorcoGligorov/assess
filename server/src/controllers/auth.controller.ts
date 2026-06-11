import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { env } from '../config/env';
import { CreateUserDto, LoginDto } from '../models/user.model';

const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign(
    { userId, role },
    env.jwtSecret,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { userId, role },
    env.jwtRefreshSecret,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, role = 'renter' }: CreateUserDto = req.body;

    if (!email || !password || !full_name) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (email, password, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, created_at`,
      [email, hashedPassword, full_name, role]
    );

    const user = result.rows[0];
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginDto = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT id, email, full_name, role, avatar_url, phone, created_at FROM users WHERE id = $1',
      [(req as any).userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ message: 'Refresh token required' });
      return;
    }

    const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as {
      userId: string;
      role: string;
    };

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      decoded.userId,
      decoded.role
    );

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};