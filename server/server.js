import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Route imports
import boardRoutes from './routes/boards.js';
import listRoutes from './routes/lists.js';
import cardRoutes from './routes/cards.js';
import labelRoutes from './routes/labels.js';
import memberRoutes from './routes/members.js';
import checklistRoutes from './routes/checklists.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/checklists', checklistRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Trello Clone API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Trello Clone API',
    version: '1.0.0',
    endpoints: {
      boards: '/api/boards',
      lists: '/api/lists',
      cards: '/api/cards',
      labels: '/api/labels',
      members: '/api/members',
      checklists: '/api/checklists'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
