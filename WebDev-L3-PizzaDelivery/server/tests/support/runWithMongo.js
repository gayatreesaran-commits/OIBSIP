/**
 * Test entry point: provides a MongoDB replica set, then runs vitest against it.
 *
 * Why outside vitest: starting mongodb-memory-server from inside vitest proved unreliable
 * on Windows. A replica set (not a standalone server) is required because the app uses
 * multi-document transactions for stock and payments.
 *
 * Set TEST_MONGODB_URI to reuse an existing replica set (CI service, local cluster) and
 * skip the in-memory one.
 *
 * If no replica set can be started, suites that need a database are skipped (not failed)
 * and a warning explains how to supply one.
 *
 * Usage: node tests/support/runWithMongo.js [vitest args]   (defaults to `run`)
 */
import { spawn } from 'node:child_process';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

// mongod occasionally stalls in its first seconds (antivirus scanning the fresh data dir);
// a short timeout plus retries recovers faster than one long wait.
const LAUNCH_TIMEOUT_MS = 30_000;
const START_ATTEMPTS = 2;
const FAILURE_EXIT_CODE = 1;

// create() can stall past launchTimeout (seen on Windows), so the whole startup gets a hard cap.
const STARTUP_DEADLINE_MS = 75_000;

function withDeadline(promise, ms) {
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`mongod did not start within ${ms}ms`)), ms);
  });
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer));
}

function startReplicaSet() {
  return withDeadline(startReplicaSetWithRetries(), STARTUP_DEADLINE_MS);
}

async function startReplicaSetWithRetries() {
  let lastError;
  for (let attempt = 1; attempt <= START_ATTEMPTS; attempt += 1) {
    try {
      return await MongoMemoryReplSet.create({
        replSet: { count: 1 },
        instanceOpts: [{ launchTimeout: LAUNCH_TIMEOUT_MS }],
      });
    } catch (error) {
      lastError = error;
      process.stderr.write(`mongod start attempt ${attempt}/${START_ATTEMPTS} failed\n`);
    }
  }
  throw lastError;
}

function runVitest(args, env) {
  const vitestArgs = args.length > 0 ? args : ['run'];
  return new Promise((resolve) => {
    const child = spawn('pnpm', ['exec', 'vitest', ...vitestArgs], {
      stdio: 'inherit',
      shell: true,
      env,
    });
    child.on('exit', (code) => resolve(code ?? FAILURE_EXIT_CODE));
  });
}

async function main() {
  const args = process.argv.slice(2);
  let replSet;
  const env = { ...process.env };

  if (!env.TEST_MONGODB_URI) {
    try {
      replSet = await startReplicaSet();
      env.TEST_MONGODB_URI = replSet.getUri();
    } catch (error) {
      process.stderr.write(
        [
          '',
          `WARNING: no test database available (${error.message}).`,
          'Database suites will be skipped. Set TEST_MONGODB_URI to a replica set or an',
          'Atlas test cluster to run them.',
          '',
        ].join('\n'),
      );
    }
  }

  try {
    return await runVitest(args, env);
  } finally {
    await replSet?.stop();
  }
}

main().then(
  (code) => process.exit(code),
  (error) => {
    process.stderr.write(`${error.message}\n`);
    process.exit(FAILURE_EXIT_CODE);
  },
);
