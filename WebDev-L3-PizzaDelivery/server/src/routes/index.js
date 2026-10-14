import { Router } from 'express';
import { createAdminAuthController } from '../controllers/admin/adminAuth.controller.js';
import { createAuthController } from '../controllers/auth.controller.js';
import { createAuthenticate } from '../middleware/authenticate.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { buildAuthSchemas } from '../validators/auth.schema.js';
import { createAdminAuthRoutes } from './admin/adminAuth.routes.js';
import { createAuthRoutes } from './auth.routes.js';
import { createHealthRoutes } from './health.routes.js';

/** Composes every versioned router. New feature routers are mounted here. */
export function createApiRouter({ container }) {
  const { config, services } = container;
  const router = Router();

  const authenticate = createAuthenticate({ tokenService: services.token });
  const authLimiter = createRateLimiter(config.security.rateLimit.auth, {
    standardHeaders: config.security.rateLimit.standardHeaders,
  });
  const authSchemas = buildAuthSchemas(config.auth);

  router.use('/health', createHealthRoutes({ appName: config.app.name }));
  router.use(
    '/auth',
    createAuthRoutes({
      controller: createAuthController({ authService: services.auth }),
      schemas: authSchemas,
      authenticate,
      authLimiter,
    }),
  );
  router.use(
    '/admin/auth',
    createAdminAuthRoutes({
      controller: createAdminAuthController({ authService: services.auth }),
      schemas: authSchemas,
      authLimiter,
    }),
  );

  return router;
}
