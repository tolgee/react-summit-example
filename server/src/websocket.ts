import WebSocket from 'ws';
import http from 'http';
import { getOptionsWithVotes } from './db';
import { logger } from './logger';

let wss: WebSocket.Server;

const logConnectedUsers = () => {
  if (!wss) {
    logger.error('WebSocket server not yet initialized');
    return;
  }

  const connectedUsers = wss.clients.size;
  logger.info(`Number of users currently connected: ${connectedUsers}`);
};

export const initWebSocket = (server: http.Server) => {
  wss = new WebSocket.Server({
    server,
    path: '/api/ws'
  });

  wss.on('connection', (ws) => {
    sendOptionsToClient(ws);

    ws.on('error', (error) => {
      logger.error('WebSocket error:', error);
    });

    ws.on('close', () => {
      // Nothing
    });
  });

  setInterval(logConnectedUsers, 10 * 60 * 1000);

  logger.info('WebSocket server initialized');
};

export const sendOptionsToClient = async (ws: WebSocket) => {
  try {
    const options = await getOptionsWithVotes();
    ws.send(JSON.stringify({ type: 'options', data: options }));
  } catch (error) {
    logger.error('Error sending options to client:', error);
  }
};

export const broadcastOptions = async () => {
  if (!wss) {
    logger.error('WebSocket server not initialized');
    return;
  }

  try {
    const options = await getOptionsWithVotes();
    const message = JSON.stringify({ type: 'options', data: options });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  } catch (error) {
    logger.error('Error broadcasting options:', error);
  }
};

export default {
  initWebSocket,
  broadcastOptions
};
