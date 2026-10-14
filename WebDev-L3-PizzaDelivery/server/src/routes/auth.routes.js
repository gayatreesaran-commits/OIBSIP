import { Router } from 'express';
import { validate } from '../middleware/validate.js';

export function createAuthRoutes({ controller, schemas, authenticate, authLimiter }) {
  const router = Router();
  router.use(authLimiter);

  router.post('/register', validate({ body: schemas.register }), controller.register);
  router.post('/verify-email', validate({ body: schemas.verifyEmail }), controller.verifyEmail);
  router.post(
    '/resend-verification',
    validate({ body: schemas.resendVerification }),
    controller.resendVerification,
  );
  router.post('/login', validate({ body: schemas.login }), controller.login);
  router.post(
    '/forgot-password',
    validate({ body: schemas.forgotPassword }),
    controller.forgotPassword,
  );
  router.post(
    '/reset-password',
    validate({ body: schemas.resetPassword }),
    controller.resetPassword,
  );
  router.get('/me', authenticate, controller.me);
  return router;
}
