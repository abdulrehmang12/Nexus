require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const meetingRoutes = require('./routes/meetings');
const documentRoutes = require('./routes/documents');
const paymentRoutes = require('./routes/payments');
const swaggerSpec = require('./docs/swagger');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
let mongoReady = false;
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(express.json({ limit: '10mb' }));
app.use('/api', apiLimiter);
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/api/health', (_req, res) =>
  res.json({
    ok: true,
    database: mongoReady ? 'connected' : 'connecting',
  })
);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payments', paymentRoutes);

// WebRTC Signaling (Video Calls)
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, userId }) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', { userId, socketId: socket.id });
  });

  socket.on('offer', ({ roomId, offer }) => {
    socket.to(roomId).emit('offer', { offer, socketId: socket.id });
  });

  socket.on('answer', ({ roomId, answer }) => {
    socket.to(roomId).emit('answer', { answer, socketId: socket.id });
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', { candidate, socketId: socket.id });
  });

  socket.on('toggle-media', ({ roomId, kind, enabled }) => {
    socket.to(roomId).emit('toggle-media', { socketId: socket.id, kind, enabled });
  });

  socket.on('disconnecting', () => {
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        socket.to(roomId).emit('user-disconnected', { socketId: socket.id });
      }
    });
  });
});

// Server and Database Start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexus';

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    mongoReady = true;
  })
  .catch(err => console.error(err));
