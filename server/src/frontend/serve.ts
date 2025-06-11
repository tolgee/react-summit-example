import express from 'express';
import path from 'path';
import fs from 'fs';
import { logger } from '../logger';

export function serveFrontend(app: express.Application): void {
  const frontendBuildPath = path.resolve(__dirname, '../../../dist');

  if (!fs.existsSync(frontendBuildPath)) {
    logger.warn(`Frontend build directory not found at: ${frontendBuildPath}`);
    return;
  }

  logger.info(`Serving frontend static files from: ${frontendBuildPath}`);
  app.use(express.static(frontendBuildPath));

  app.get('{/*path}', (req, res) => {
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ error: 'API endpoint not found' });
      return;
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}