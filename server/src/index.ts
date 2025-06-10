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
  app.get('{/*path}', (req, res) => {
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ error: 'API endpoint not found' });
      return;
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

function forwardFrontend() {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  logger.info(`Forwarding frontend requests to: ${frontendUrl}`);
  app.all('{/*path}', (req, res) => {
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ error: 'API endpoint not found' });
      return;
    }

    const parsedUrl = new URL(req.path, frontendUrl);
    logger.info(`Proxying ${req.method} request to: ${parsedUrl.toString()}`);

    const headers = { ...req.headers };
    headers.host = parsedUrl.host;
    delete headers['connection'];
    delete headers['content-length'];

    const proxyReq = http.request({
      protocol: parsedUrl.protocol,
      host: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: req.method,
      headers: headers
    }, (proxyRes) => {
      res.status(proxyRes.statusCode || 200);
      Object.keys(proxyRes.headers).forEach(key => {
        if (key !== 'connection' && key !== 'keep-alive' && key !== 'transfer-encoding') {
          res.setHeader(key, proxyRes.headers[key] || '');
        }
      });
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      logger.error('Error proxying request:', err);
      res.status(500).send('Error proxying request to frontend');
    });

    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }

    if (req.readable) {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
  })
}

if (isProduction) {
  serveFrontend();
} else {
  forwardFrontend();
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
