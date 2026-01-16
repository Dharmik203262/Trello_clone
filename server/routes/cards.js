import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

/**
 * POST /api/cards
 * Create a new card
 */
router.post('/', async (req, res) => {
  try {
    const { listId, title } = req.body;

    if (!listId || !title) {
      return res.status(400).json({ error: 'List ID and title are required' });
    }

    // Get the highest position for this list
    const maxPosition = await prisma.card.findFirst({
      where: { listId: parseInt(listId), archived: false },
      orderBy: { position: 'desc' },
      select: { position: true }
    });

    const position = maxPosition ? maxPosition.position + 1 : 0;

    const card = await prisma.card.create({
      data: {
        listId: parseInt(listId),
        title,
        position
      },
      include: {
        labels: {
          include: { label: true }
        },
        members: {
          include: { member: true }
        },
        checklists: {
          include: { items: true }
        }
      }
    });

    res.status(201).json(card);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

/**
 * PUT /api/cards/move
 * Move card between lists or reorder within a list
 * NOTE: This route MUST come before /:id to avoid matching "move" as an id
 */
router.put('/move', async (req, res) => {
  try {
    const { cardId, sourceListId, destListId, sourcePosition, destPosition } = req.body;

    if (!cardId || !destListId || destPosition === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const parsedCardId = parseInt(cardId);
    const parsedDestListId = parseInt(destListId);
    const parsedSourceListId = parseInt(sourceListId);

    await prisma.$transaction(async (tx) => {
      // If moving to a different list
      if (parsedSourceListId !== parsedDestListId) {
        // Update positions in the source list
        await tx.card.updateMany({
          where: {
            listId: parsedSourceListId,
            position: { gt: sourcePosition },
            archived: false
          },
          data: {
            position: { decrement: 1 }
          }
        });

        // Update positions in the destination list
        await tx.card.updateMany({
          where: {
            listId: parsedDestListId,
            position: { gte: destPosition },
            archived: false
          },
          data: {
            position: { increment: 1 }
          }
        });

        // Move the card
        await tx.card.update({
          where: { id: parsedCardId },
          data: {
            listId: parsedDestListId,
            position: destPosition
          }
        });
      } else {
        // Reordering within the same list
        if (sourcePosition < destPosition) {
          // Moving down
          await tx.card.updateMany({
            where: {
              listId: parsedDestListId,
              position: { gt: sourcePosition, lte: destPosition },
              archived: false,
              id: { not: parsedCardId }
            },
            data: {
              position: { decrement: 1 }
            }
          });
        } else {
          // Moving up
          await tx.card.updateMany({
            where: {
              listId: parsedDestListId,
              position: { gte: destPosition, lt: sourcePosition },
              archived: false,
              id: { not: parsedCardId }
            },
            data: {
              position: { increment: 1 }
            }
          });
        }

        // Update the card position
        await tx.card.update({
          where: { id: parsedCardId },
          data: { position: destPosition }
        });
      }
    });

    res.json({ success: true, message: 'Card moved successfully' });
  } catch (error) {
    console.error('Error moving card:', error);
    res.status(500).json({ error: 'Failed to move card' });
  }
});

/**
 * GET /api/cards/search
 * Search cards by title
 * NOTE: This route MUST come before /:id to avoid matching "search" as an id
 */
router.get('/search', async (req, res) => {
  try {
    const { q, boardId } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const cards = await prisma.card.findMany({
      where: {
        title: {
          contains: q
        },
        archived: false,
        ...(boardId && {
          list: {
            boardId: parseInt(boardId)
          }
        })
      },
      include: {
        list: true,
        labels: {
          include: { label: true }
        },
        members: {
          include: { member: true }
        }
      }
    });

    res.json(cards);
  } catch (error) {
    console.error('Error searching cards:', error);
    res.status(500).json({ error: 'Failed to search cards' });
  }
});

/**
 * PUT /api/cards/:id
 * Update card details (title, description, dueDate)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const card = await prisma.card.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        labels: {
          include: { label: true }
        },
        members: {
          include: { member: true }
        },
        checklists: {
          include: { items: true }
        }
      }
    });

    res.json(card);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

/**
 * PUT /api/cards/:id/archive
 * Archive or unarchive a card
 */
router.put('/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const { archived } = req.body;

    const card = await prisma.card.update({
      where: { id: parseInt(id) },
      data: { archived: archived === true }
    });

    res.json(card);
  } catch (error) {
    console.error('Error archiving card:', error);
    res.status(500).json({ error: 'Failed to archive card' });
  }
});

/**
 * DELETE /api/cards/:id
 * Delete a card permanently
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.card.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

export default router;
