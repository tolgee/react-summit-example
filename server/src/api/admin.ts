import express from 'express';
import {addOption, deleteOption, resetDb} from '../db';
import { logger } from '../logger';
import { broadcastOptions } from '../websocket';

const ADMIN_KEY = process.env.ADMIN_KEY;

const router = express.Router();

router.use((req, res, next) => {
  const adminKey = req.headers['x-admin-key'];

  if (!ADMIN_KEY) {
    logger.warn('Admin key not set, cannot authorize admin access');
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (!adminKey) {
    logger.warn('Admin key not provided, cannot authorize admin access');
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (adminKey !== ADMIN_KEY) {
    logger.warn(`Unauthorized admin access attempt with key: ${adminKey}`);
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
});

// Reset the database
router.post('/admin/reset', async (req, res) => {
  try {
    await resetDb();
    await broadcastOptions();
    res.json({ success: true, message: 'Database reset successfully' });
  } catch (error) {
    logger.error('Error resetting database:', error);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// Add a new option
router.post('/admin/options', async (req, res) => {
  try {
    const { option } = req.body;

    if (!option) {
      res.status(400).json({ error: 'Option is required' });
      return;
    }

    await addOption(option);
    await broadcastOptions();
    res.status(201).json({ success: true, message: 'Option added successfully' });
  } catch (error) {
    logger.error('Error adding option:', error);
    res.status(500).json({ error: 'Failed to add option' });
  }
});

// Delete an option
router.delete('/admin/options/:option', async (req, res) => {
  try {
    const option = req.params.option;

    await deleteOption(option);
    await broadcastOptions();
    res.json({ success: true, message: 'Option deleted successfully' });
  } catch (error) {
    logger.error('Error deleting option:', error);
    res.status(500).json({ error: 'Failed to delete option' });
  }
});

export default router;