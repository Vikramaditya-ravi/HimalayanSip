#!/usr/bin/env node
/**
 * Local PostgreSQL for integration tests.
 *
 * Drives the real Postgres binaries shipped by `embedded-postgres` directly via
 * initdb/pg_ctl rather than using that package's JS wrapper, which hangs on
 * Windows. Real Postgres matters here: the analytics SQL leans on
 * PERCENTILE_CONT, ARRAY_AGG(... ORDER BY), FILTER, and FULL OUTER JOIN, none
 * of which an in-memory emulator implements faithfully enough to trust.
 *
 *   node scripts/pg.mjs start   # initdb (if needed), start, create database
 *   node scripts/pg.mjs stop
 *   node scripts/pg.mjs status
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BIN = join(ROOT, 'node_modules', '@embedded-postgres', 'windows-x64', 'native', 'bin');
const BIN_NIX = join(ROOT, 'node_modules', '@embedded-postgres', 'linux-x64', 'native', 'bin');
const binDir = existsSync(BIN) ? BIN : BIN_NIX;
const exe = (name) => join(binDir, process.platform === 'win32' ? `${name}.exe` : name);

export const PORT = Number(process.env.TEST_PG_PORT ?? 54329);
export const DB_NAME = 'aquavia_test';
export const CONNECTION = `postgresql://postgres:postgres@127.0.0.1:${PORT}/${DB_NAME}`;

const DATA_DIR = process.env.TEST_PG_DIR ?? join(ROOT, '.pgdata');
const LOG_FILE = join(ROOT, '.pgdata.log');

function run(cmd, args, stdio = ['ignore', 'pipe', 'pipe']) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio });
}

/**
 * `pg_ctl start` must run with stdio fully ignored.
 *
 * The server it spawns inherits the parent's file descriptors and keeps them
 * open for its whole lifetime, so a piped stdout means execFileSync waits for
 * an EOF that never comes and the caller hangs indefinitely. `-l` already sends
 * the server's own log to a file, so nothing is lost by discarding these.
 */
function runDetached(cmd, args) {
  return execFileSync(cmd, args, { stdio: 'ignore' });
}

export function isRunning() {
  try {
    run(exe('pg_ctl'), ['-D', DATA_DIR, 'status']);
    return true;
  } catch {
    return false;
  }
}

export async function start() {
  if (!existsSync(join(DATA_DIR, 'PG_VERSION'))) {
    mkdirSync(dirname(DATA_DIR), { recursive: true });
    const pwFile = join(ROOT, '.pgpass.tmp');
    writeFileSync(pwFile, 'postgres');
    run(exe('initdb'), ['-D', DATA_DIR, '-U', 'postgres', '-A', 'password', `--pwfile=${pwFile}`, '-E', 'UTF8']);
    console.log('initdb: ok');
  }

  if (!isRunning()) {
    runDetached(exe('pg_ctl'), [
      '-D', DATA_DIR, '-l', LOG_FILE,
      '-o', `-p ${PORT} -c listen_addresses=127.0.0.1`,
      '-w', 'start',
    ]);
    console.log(`postgres: listening on 127.0.0.1:${PORT}`);
  } else {
    console.log('postgres: already running');
  }

  const client = new pg.Client({ host: '127.0.0.1', port: PORT, user: 'postgres', password: 'postgres', database: 'postgres' });
  await client.connect();
  const { rowCount } = await client.query('select 1 from pg_database where datname=$1', [DB_NAME]);
  if (!rowCount) {
    await client.query(`create database ${DB_NAME}`);
    console.log(`database: created ${DB_NAME}`);
  }
  await client.end();

  return CONNECTION;
}

export function stop() {
  if (!isRunning()) {
    console.log('postgres: not running');
    return;
  }
  run(exe('pg_ctl'), ['-D', DATA_DIR, '-m', 'fast', '-w', 'stop']);
  console.log('postgres: stopped');
}

/**
 * start -> push schema -> run integration tests, with DATABASE_URL injected.
 * Done here rather than in the npm script because inline `VAR=x cmd` prefixes
 * do not work on Windows shells.
 */
async function test() {
  await start();
  const env = { ...process.env, DATABASE_URL: CONNECTION, DIRECT_URL: CONNECTION };
  const opts = { stdio: 'inherit', env, shell: true, cwd: ROOT };
  execFileSync('npx', ['prisma', 'db', 'push', '--skip-generate', '--accept-data-loss'], opts);
  execFileSync('npx', ['vitest', 'run', '--config', 'vitest.integration.config.ts'], opts);
}

const cmd = process.argv[2];
if (cmd === 'test') {
  await test();
} else if (cmd === 'start') {
  console.log(await start());
} else if (cmd === 'stop') {
  stop();
} else if (cmd === 'status') {
  console.log(isRunning() ? 'running' : 'stopped');
} else if (cmd) {
  console.error('usage: node scripts/pg.mjs start|stop|status');
  process.exit(1);
}
