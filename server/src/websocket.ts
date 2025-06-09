import WebSocket from 'ws';
import http from 'http';
import { getOptionsWithVotes } from './db';

let wss: WebSocket.Server;

// Initialize WebSocket server
export const initWebSocket = (server: http.Server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected');

    // Send initial data to the client
    sendOptionsToClient(ws);

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  console.log('WebSocket server initialized');
};

// Send options with votes to a specific client
export const sendOptionsToClient = async (ws: WebSocket) => {
  try {
    const options = await getOptionsWithVotes();
    ws.send(JSON.stringify({ type: 'options', data: options }));
  } catch (error) {
    console.error('Error sending options to client:', error);
  }
};

// Broadcast options with votes to all connected clients
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