import { Pool } from 'pg';
import { env } from './env';

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database error:', err);
  process.exit(1);
});

export const query = (text: string, params?: unknown[]) => {
  return pool.query(text, params);
};

export default pool;