import { inventoryRepository } from './repositories/inventory.repository.js';
import { pizzaRepository } from './repositories/pizza.repository.js';
import { tokenRepository } from './repositories/token.repository.js';
import { userRepository } from './repositories/user.repository.js';
import { createEmailProvider } from './providers/email/index.js';
import { createPaymentProvider } from './providers/payment/index.js';
import { createAuthService } from './services/auth.service.js';
import { createNotificationService } from './services/notification.service.js';
import { createPasswordService } from './services/password.service.js';
import { createTokenService } from './services/token.service.js';
import { systemClock } from './utils/clock.js';

/**
 * Composition root: the one place that decides which concrete implementation backs each
 * dependency. Tests pass `overrides` (fake repositories, providers, clock) to swap pieces.
 */
export function createContainer({ config, logger, overrides = {} }) {
  const { env } = config;
  const clock = overrides.clock ?? systemClock;

  const repositories = {
    user: userRepository,
    token: tokenRepository,
    inventory: inventoryRepository,
    pizza: pizzaRepository,
    ...overrides.repositories,
  };

  const providers = {
    email: overrides.emailProvider ?? createEmailProvider({ env, mailConfig: config.mail, logger }),
    payment:
      overrides.paymentProvider ??
      createPaymentProvider({ env, paymentConfig: config.payment, logger }),
  };

  const passwordService = createPasswordService({ authConfig: config.auth });
  const tokenService = createTokenService({
    env,
    authConfig: config.auth,
    tokenRepository: repositories.token,
    clock,
  });
  const notificationService = createNotificationService({
    emailProvider: providers.email,
    env,
    mailConfig: config.mail,
    authConfig: config.auth,
  });
  const authService = createAuthService({
    userRepository: repositories.user,
    tokenRepository: repositories.token,
    tokenService,
    passwordService,
    notificationService,
    authConfig: config.auth,
    clock,
    logger,
  });

  return {
    config,
    logger,
    clock,
    repositories,
    providers,
    services: {
      password: passwordService,
      token: tokenService,
      notification: notificationService,
      auth: authService,
    },
  };
}
