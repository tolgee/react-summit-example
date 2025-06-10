import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { initDb, getOptionsWithVotes, addVote, closeDb } from './db';
import { initWebSocket, broadcastOptions } from './websocket';
import { logger } from './logger';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
initWebSocket(server);

const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, '../data');
logger.info(`Using data directory: ${dataDir}`);

initDb().catch(err => {
  logger.error('Failed to initialize database:', err);
  process.exit(1);
});

app.get('/api/options', async (req, res) => {
  try {
    const options = await getOptionsWithVotes();
    res.json(options);
  } catch (error) {
    logger.error('Error getting options:', error);
    res.status(500).json({ error: 'Failed to get options' });
  }
});

app.post('/api/vote', async (req, res) => {
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

const frontendBuildPath = path.resolve(__dirname, '../../dist');

function serveFrontend() {
  if (!fs.existsSync(frontendBuildPath)) {
    logger.warn(`Frontend build directory not found at: ${frontendBuildPath}`);
    return;
  }
  logger.info(`Serving frontend static files from: ${frontendBuildPath}`);
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ error: 'API endpoint not found' });
      return;
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

if (isProduction) {
  serveFrontend();
}

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

process.on('SIGINT', () => {
  logger.info('Shutting down server...');
  server.close(() => {
    logger.info('HTTP server closed');
    closeDb();
    process.exit(0);
  });
});

export default server;
