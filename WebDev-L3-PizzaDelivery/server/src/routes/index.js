import { Router } from 'express';
import { createHealthRoutes } from './health.routes.js';

/** Composes every versioned router. New feature routers are mounted here. */
export function createApiRouter({ config }) {
  const router = Router();
  router.use('/health', createHealthRoutes({ appName: config.app.name }));
  return router;
}
