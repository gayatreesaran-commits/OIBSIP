import { createApp } from '../../src/app.js';
import { buildConfig } from '../../src/config/index.js';
import { createContainer } from '../../src/container.js';
import { createLogger } from '../../src/utils/logger.js';
import { deepMerge } from '../../src/utils/merge.js';
import {
  createFakeClock,
  createFakeEmailProvider,
  createFakeTokenRepository,
  createFakeUserRepository,
} from './fakes.js';

// Lowest cost bcrypt accepts; the production value would make auth suites crawl.
const TEST_BCRYPT_ROUNDS = 4;
const TEST_CONFIG_OVERRIDES = { auth: { password: { bcryptRounds: TEST_BCRYPT_ROUNDS } } };

/**
 * Builds the real app against the test env from vitest.config.js, with in-memory
 * repositories and a recording email provider so no database or network is involved.
 * Pass `useFakes: false` for suites that run against a real database.
 */
export function createTestApp({
  envOverrides = {},
  configOverrides = {},
  overrides = {},
  useFakes = true,
} = {}) {
  const config = buildConfig(
    { ...process.env, ...envOverrides },
    deepMerge(TEST_CONFIG_OVERRIDES, configOverrides),
  );
  const logger = createLogger({
    name: config.app.name,
    level: config.env.LOG_LEVEL,
    redactPaths: config.security.logRedactPaths,
  });

  const clock = overrides.clock ?? createFakeClock();
  const fakes = useFakes
    ? {
        emailProvider: createFakeEmailProvider(),
        repositories: {
          user: createFakeUserRepository(),
          token: createFakeTokenRepository(clock),
        },
      }
    : {};

  const container = createContainer({
    config,
    logger,
    overrides: { clock, ...fakes, ...overrides },
  });
  const app = createApp({ config, logger, container });
  return { app, config, logger, container, clock, fakes };
}
