import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

/**
 * GET /api/labels/:boardId
 * Get all labels for a board
 */
router.get('/:boardId', async (req, res) => {
  try {
    const { boardId } = req.params;

    const labels = await prisma.label.findMany({
      where: { boardId: parseInt(boardId) },
      orderBy: { id: 'asc' }
    });

    res.json(labels);
  } catch (error) {
    console.error('Error fetching labels:', error);
    res.status(500).json({ error: 'Failed to fetch labels' });
  }
});

/**
 * POST /api/labels
 * Create a new label
 */
router.post('/', async (req, res) => {
  try {
    const { boardId, name, color } = req.body;

    if (!boardId || !name || !color) {
      return res.status(400).json({ error: 'Board ID, name, and color are required' });
    }

    const label = await prisma.label.create({
      data: {
        boardId: parseInt(boardId),
        name,
        color
      }
    });

    res.status(201).json(label);
  } catch (error) {
    console.error('Error creating label:', error);
    res.status(500).json({ error: 'Failed to create label' });
  }
});

/**
 * POST /api/cards/:cardId/labels/:labelId
 * Add a label to a card
 */
router.post('/cards/:cardId/labels/:labelId', async (req, res) => {
  try {
    const { cardId, labelId } = req.params;

    await prisma.cardLabel.create({
      data: {
        cardId: parseInt(cardId),
        labelId: parseInt(labelId)
      }
    });

    // Fetch updated card with labels
    const card = await prisma.card.findUnique({
      where: { id: parseInt(cardId) },
      include: {
        labels: {
          include: { label: true }
        }
      }
    });

    res.json(card);
  } catch (error) {
    console.error('Error adding label to card:', error);
    res.status(500).json({ error: 'Failed to add label to card' });
  }
});

/**
 * DELETE /api/cards/:cardId/labels/:labelId
 * Remove a label from a card
 */
router.delete('/cards/:cardId/labels/:labelId', async (req, res) => {
  try {
    const { cardId, labelId } = req.params;

    await prisma.cardLabel.delete({
      where: {
        cardId_labelId: {
          cardId: parseInt(cardId),
          labelId: parseInt(labelId)
        }
      }
    });

    // Fetch updated card with labels
    const card = await prisma.card.findUnique({
      where: { id: parseInt(cardId) },
      include: {
        labels: {
          include: { label: true }
        }
      }
    });

    res.json(card);
  } catch (error) {
    console.error('Error removing label from card:', error);
    res.status(500).json({ error: 'Failed to remove label from card' });
  }
});

export default router;
