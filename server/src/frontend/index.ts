import express from 'express';
import { serveFrontend } from './serve';
import { forwardFrontend } from './forward';

export function setupFrontend(app: express.Application): void {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    serveFrontend(app);
  } else {
    forwardFrontend(app);
  }
}