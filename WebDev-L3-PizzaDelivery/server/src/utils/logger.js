import pino from 'pino';

/** Creates the process logger. Redaction paths come from config so secrets never reach logs. */
export function createLogger({ level, redactPaths, name }) {
  return pino({
    name,
    level,
    redact: { paths: redactPaths, censor: '[redacted]' },
  });
}
