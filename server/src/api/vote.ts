import express from 'express';
import { addVote } from '../db';
import { broadcastOptions } from '../websocket';
import { logger } from '../logger';

const router = express.Router();

router.post('/vote', async (req, res) => {
  try {
    const { option, email } = req.body;

    if (option === undefined || option === null) {
      res.status(400).json({ error: 'Option is required' });
      return;
    }

    const result = await addVote(option, email);
    await broadcastOptions();
    res.json(result);
  } catch (error) {
    logger.error('Error adding vote:', error);
    res.status(500).json({ error: 'Failed to add vote' });
  }
});

export default router;