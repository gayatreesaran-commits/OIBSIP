import { z } from 'zod';
import { envSchema } from './env.schema.js';

export class EnvironmentError extends Error {
  constructor(details) {
    super(`Invalid environment configuration:\n${details}`);
    this.name = 'EnvironmentError';
  }
}

/** Validates a raw env object. Throws one readable error listing every problem. */
export function parseEnv(source = process.env) {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new EnvironmentError(z.prettifyError(result.error));
  }
  return Object.freeze(result.data);
}
