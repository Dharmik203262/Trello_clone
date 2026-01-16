import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

/**
 * POST /api/lists
 * Create a new list
 */
router.post('/', async (req, res) => {
  try {
    const { boardId, title } = req.body;

    if (!boardId || !title) {
      return res.status(400).json({ error: 'Board ID and title are required' });
    }

    // Get the highest position for this board
    const maxPosition = await prisma.list.findFirst({
      where: { boardId: parseInt(boardId) },
      orderBy: { position: 'desc' },
      select: { position: true }
    });

    const position = maxPosition ? maxPosition.position + 1 : 0;

    const list = await prisma.list.create({
      data: {
        boardId: parseInt(boardId),
        title,
        position
      }
    });

    res.status(201).json(list);
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ error: 'Failed to create list' });
  }
});

/**
 * PUT /api/lists/reorder
 * Reorder lists
 * MUST come before /:id route to avoid "reorder" being matched as an ID
 */
router.put('/reorder', async (req, res) => {
  try {
    const { lists } = req.body; // Array of { id, position }

    if (!lists || !Array.isArray(lists)) {
      return res.status(400).json({ error: 'Lists array is required' });
    }

    if (lists.length === 0) {
      return res.status(400).json({ error: 'Lists array cannot be empty' });
    }

    // Validate each list has id and position
    for (const list of lists) {
      if (list.id === undefined || list.id === null) {
        return res.status(400).json({ error: 'Each list must have an id' });
      }
      if (list.position === undefined || list.position === null) {
        return res.status(400).json({ error: 'Each list must have a position' });
      }
    }

    console.log('Reordering lists:', lists);

    // Update positions in a transaction
    await prisma.$transaction(
      lists.map(({ id, position }) =>
        prisma.list.update({
          where: { id: parseInt(id) },
          data: { position: parseInt(position) }
        })
      )
    );

    res.json({ success: true, message: 'Lists reordered successfully' });
  } catch (error) {
    console.error('Error reordering lists:', error);
    res.status(500).json({ error: 'Failed to reorder lists', details: error.message });
  }
});

/**
 * PUT /api/lists/:id
 * Update list title
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const list = await prisma.list.update({
      where: { id: parseInt(id) },
      data: { title }
    });

    res.json(list);
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({ error: 'Failed to update list' });
  }
});

/**
 * DELETE /api/lists/:id
 * Delete a list
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.list.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: 'List deleted successfully' });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

export default router;
