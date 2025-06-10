import WebSocket from 'ws';
import http from 'http';
import { getOptionsWithVotes } from './db';

let wss: WebSocket.Server;

const logConnectedUsers = () => {
  if (!wss) {
    console.error('WebSocket server not yet initialized');
    return;
  }

  const connectedUsers = wss.clients.size;
  console.log(`Number of users currently connected: ${connectedUsers}`);
};

export const initWebSocket = (server: http.Server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    sendOptionsToClient(ws);

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
      // Nothing
    });
  });

  setInterval(logConnectedUsers, 10 * 60 * 1000);
  logConnectedUsers();

  console.log('WebSocket server initialized');
};

export const sendOptionsToClient = async (ws: WebSocket) => {
  try {
    const options = await getOptionsWithVotes();
    ws.send(JSON.stringify({ type: 'options', data: options }));
  } catch (error) {
    console.error('Error sending options to client:', error);
  }
};

export const broadcastOptions = async () => {
  if (!wss) {
    console.error('WebSocket server not initialized');
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
    console.error('Error broadcasting options:', error);
  }
};

export default {
  initWebSocket,
  broadcastOptions
};
