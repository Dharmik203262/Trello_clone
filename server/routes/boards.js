import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

/**
 * GET /api/boards
 * Get all boards
 */
router.get('/', async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

/**
 * GET /api/boards/:id
 * Get single board with all lists and cards (with nested data)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const board = await prisma.board.findUnique({
      where: { id: parseInt(id) },
      include: {
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              where: { archived: false },
              orderBy: { position: 'asc' },
              include: {
                labels: {
                  include: {
                    label: true
                  }
                },
                members: {
                  include: {
                    member: true
                  }
                },
                checklists: {
                  orderBy: { position: 'asc' },
                  include: {
                    items: {
                      orderBy: { position: 'asc' }
                    }
                  }
                }
              }
            }
          }
        },
        labels: {
          orderBy: { id: 'asc' }
        }
      }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
});

/**
 * POST /api/boards
 * Create a new board
 */
router.post('/', async (req, res) => {
  try {
    const { title, backgroundColor } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const board = await prisma.board.create({
      data: {
        title,
        backgroundColor: backgroundColor || '#0079bf'
      }
    });

    res.status(201).json(board);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

export default router;
