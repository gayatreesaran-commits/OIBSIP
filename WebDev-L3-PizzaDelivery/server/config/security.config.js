import { MINUTE_MS } from './units.js';

export default {
  bodyLimit: '100kb',
  requestIdHeader: 'x-request-id',
  cors: {
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    maxAgeSeconds: 600,
  },
  rateLimit: {
    standardHeaders: 'draft-8',
    general: { windowMs: 15 * MINUTE_MS, limit: 300 },
    auth: { windowMs: 15 * MINUTE_MS, limit: 20 },
  },
  logRedactPaths: [
    'req.headers.authorization',
    'req.headers.cookie',
    'res.headers["set-cookie"]',
    '*.password',
    '*.token',
  ],
};
