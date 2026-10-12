import { randomUUID } from 'node:crypto';
import pinoHttp from 'pino-http';

/** Attaches a request id, echoes it back, and logs one line per completed request. */
export function requestLogger({ logger, headerName }) {
  return pinoHttp({
    logger,
    genReqId: (req, res) => {
      const id = req.headers[headerName] ?? randomUUID();
      res.setHeader(headerName, id);
      return id;
    },
    customLogLevel: (_req, res, error) => {
      if (error || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  });
}
