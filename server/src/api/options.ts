import express from 'express';
import { getOptionsWithVotes } from '../db';
import { logger } from '../logger';

const router = express.Router();

router.get('/options', async (req, res) => {
  try {
    const options = await getOptionsWithVotes();
    res.json(options);
  } catch (error) {
    logger.error('Error getting options:', error);
    res.status(500).json({ error: 'Failed to get options' });
  }
});

export default router;