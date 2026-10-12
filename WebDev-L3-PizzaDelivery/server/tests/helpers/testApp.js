import { createApp } from '../../src/app.js';
import { buildConfig } from '../../src/config/index.js';
import { createLogger } from '../../src/utils/logger.js';

/** Builds the app against the test env from vitest.config.js; overrides win over it. */
export function createTestApp(envOverrides = {}) {
  const config = buildConfig({ ...process.env, ...envOverrides });
  const logger = createLogger({
    name: config.app.name,
    level: config.env.LOG_LEVEL,
    redactPaths: config.security.logRedactPaths,
  });
  return { app: createApp({ config, logger }), config, logger };
}
