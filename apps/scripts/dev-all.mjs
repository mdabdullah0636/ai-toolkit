import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const appsDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const binDir = join(appsDir, 'node_modules', '.bin');
const binName = process.platform === 'win32' ? 'next.cmd' : 'next';

const ports = { docs: 3000, www: 3001, studio: 3002 };

const children = [];

for (const site of Object.keys(ports)) {
  const child = spawn(join(binDir, binName), ['dev', '-p', String(ports[site])], {
    cwd: join(appsDir, site),
    stdio: 'inherit',
    env: process.env,
  });
  children.push(child);
}

console.log('Sites running on:');
for (const [site, port] of Object.entries(ports)) {
  console.log(`  ${site}: http://localhost:${port}`);
}

function shutdown() {
  for (const child of children) {
    child.kill('SIGTERM');
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
