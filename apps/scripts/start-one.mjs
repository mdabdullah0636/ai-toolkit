import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SITES } from './build-one.mjs';

const appsDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const binDir = join(appsDir, 'node_modules', '.bin');
const binName = process.platform === 'win32' ? 'next.cmd' : 'next';

const defaultPort = 3000;
const ports = { docs: 3000, www: 3001, studio: 3002 };

const requested = process.argv[2];
const targets = !requested || requested === 'all' ? SITES : [requested];

if (targets.length === 0 || !targets.every(site => SITES.includes(site))) {
  console.error('Usage: start-one.mjs <docs|www|studio|all>');
  process.exit(2);
}

for (const site of targets) {
  const port = targets.length === 1 && requested !== 'all' ? defaultPort : ports[site];
  const child = spawn(join(binDir, binName), ['start', '-p', String(port)], {
    cwd: join(appsDir, site),
    stdio: 'inherit',
    env: process.env,
  });
  child.on('exit', code => process.exit(code ?? 1));
}
