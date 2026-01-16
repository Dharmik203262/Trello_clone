import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

/**
 * POST /api/checklists
 * Create a new checklist for a card
 */
router.post('/', async (req, res) => {
  try {
    const { cardId, title } = req.body;

    if (!cardId || !title) {
      return res.status(400).json({ error: 'Card ID and title are required' });
    }

    // Get the highest position for this card
    const maxPosition = await prisma.checklist.findFirst({
      where: { cardId: parseInt(cardId) },
      orderBy: { position: 'desc' },
      select: { position: true }
    });

    const position = maxPosition ? maxPosition.position + 1 : 0;

    const checklist = await prisma.checklist.create({
      data: {
        cardId: parseInt(cardId),
        title,
        position
      },
      include: {
        items: {
          orderBy: { position: 'asc' }
        }
      }
    });

    res.status(201).json(checklist);
  } catch (error) {
    console.error('Error creating checklist:', error);
    res.status(500).json({ error: 'Failed to create checklist' });
  }
});

/**
 * POST /api/checklists/:id/items
 * Add an item to a checklist
 */
router.post('/:id/items', async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Item text is required' });
    }

    // Get the highest position for this checklist
    const maxPosition = await prisma.checklistItem.findFirst({
      where: { checklistId: parseInt(id) },
      orderBy: { position: 'desc' },
      select: { position: true }
    });

    const position = maxPosition ? maxPosition.position + 1 : 0;

    const item = await prisma.checklistItem.create({
      data: {
        checklistId: parseInt(id),
        text,
        position
      }
    });

    // Return the full checklist with items
    const checklist = await prisma.checklist.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          orderBy: { position: 'asc' }
        }
      }
    });

    res.status(201).json(checklist);
  } catch (error) {
    console.error('Error adding checklist item:', error);
    res.status(500).json({ error: 'Failed to add checklist item' });
  }
});

/**
 * PUT /api/checklist-items/:id
 * Toggle checklist item completion status
 */
router.put('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const item = await prisma.checklistItem.update({
      where: { id: parseInt(id) },
      data: { completed: completed === true }
    });

    res.json(item);
  } catch (error) {
    console.error('Error updating checklist item:', error);
    res.status(500).json({ error: 'Failed to update checklist item' });
  }
});

/**
 * DELETE /api/checklist-items/:id
 * Delete a checklist item
 */
router.delete('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.checklistItem.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: 'Checklist item deleted successfully' });
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    res.status(500).json({ error: 'Failed to delete checklist item' });
  }
});

/**
 * DELETE /api/checklists/:id
 * Delete an entire checklist
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.checklist.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: 'Checklist deleted successfully' });
  } catch (error) {
    console.error('Error deleting checklist:', error);
    res.status(500).json({ error: 'Failed to delete checklist' });
  }
});

export default router;
