import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { env } from './config/env';
import pool from './config/database';
import authRoutes from './routes/auth.routes';
import propertyRoutes from './routes/property.routes';
import bookingRoutes from './routes/booking.routes';
import messageRoutes from './routes/message.routes';
import reviewRoutes from './routes/review.routes';
import { generalLimiter } from './middleware/rateLimit.middleware';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.clientUrl,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(express.json());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(generalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);

// Test DB connection
pool.query('SELECT NOW()').then(() => {
  console.log('✅ Database connected');
}).catch((err) => {
  console.error('❌ Database connection failed:', err);
});



// Socket.io
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

server.listen(env.port, () => {
  console.log(`🚀 Server running on port ${env.port}`);
});

export { io };