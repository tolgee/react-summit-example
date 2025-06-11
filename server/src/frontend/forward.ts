import express from 'express';
import http from 'http';
import { logger } from '../logger';

export function forwardFrontend(app: express.Application): void {
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
  });
}