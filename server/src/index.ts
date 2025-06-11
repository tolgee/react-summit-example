import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { initDb, closeDb } from './db';
import { initWebSocket } from './websocket';
import { logger } from './logger';
import apiRouter from './api';
import { setupFrontend } from './frontend';

const app = express();
const PORT = process.env.PORT || 3001;

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

app.use('/api', apiRouter);

setupFrontend(app);

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
