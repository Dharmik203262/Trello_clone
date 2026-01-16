import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

/**
 * GET /api/members
 * Get all members
 */
router.get('/', async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      orderBy: { name: 'asc' }
    });

    res.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

/**
 * POST /api/cards/:cardId/members/:memberId
 * Assign a member to a card
 */
router.post('/cards/:cardId/members/:memberId', async (req, res) => {
  try {
    const { cardId, memberId } = req.params;

    await prisma.cardMember.create({
      data: {
        cardId: parseInt(cardId),
        memberId: parseInt(memberId)
      }
    });

    // Fetch updated card with members
    const card = await prisma.card.findUnique({
      where: { id: parseInt(cardId) },
      include: {
        members: {
          include: { member: true }
        }
      }
    });

    res.json(card);
  } catch (error) {
    console.error('Error assigning member to card:', error);
    res.status(500).json({ error: 'Failed to assign member to card' });
  }
});

/**
 * DELETE /api/cards/:cardId/members/:memberId
 * Remove a member from a card
 */
router.delete('/cards/:cardId/members/:memberId', async (req, res) => {
  try {
    const { cardId, memberId } = req.params;

    await prisma.cardMember.delete({
      where: {
        cardId_memberId: {
          cardId: parseInt(cardId),
          memberId: parseInt(memberId)
        }
      }
    });

    // Fetch updated card with members
    const card = await prisma.card.findUnique({
      where: { id: parseInt(cardId) },
      include: {
        members: {
          include: { member: true }
        }
      }
    });

    res.json(card);
  } catch (error) {
    console.error('Error removing member from card:', error);
    res.status(500).json({ error: 'Failed to remove member from card' });
  }
});

export default router;
