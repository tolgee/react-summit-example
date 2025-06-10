import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { initDb, getOptionsWithVotes, addVote, closeDb } from './db';
import { initWebSocket, broadcastOptions } from './websocket';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
initWebSocket(server);

const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, '../data');
console.log(`Using data directory: ${dataDir}`);

initDb().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

app.get('/api/options', async (req, res) => {
  try {
    const options = await getOptionsWithVotes();
    res.json(options);
  } catch (error) {
    console.error('Error getting options:', error);
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
    console.error('Error adding vote:', error);
    res.status(500).json({ error: 'Failed to add vote' });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('HTTP server closed');
    closeDb();
    process.exit(0);
  });
});

export default server;
