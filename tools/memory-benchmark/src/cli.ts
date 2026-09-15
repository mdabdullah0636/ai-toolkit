#!/usr/bin/env node

import { measureMemory, textReport, jsonReport } from './index.js';

async function main() {
  const args = process.argv.slice(2);
  const output = args.includes('--json') ? 'json' : 'text';

  const scenario = args.find(a => !a.startsWith('--')) ?? 'default';

  console.log(`Running memory benchmark: ${scenario}\n`);

  const result = await measureMemory(async () => {
    const arr = new Array(100000).fill(0);
    arr.map((_, i) => i * 2);
    return arr.length;
  });

  if (output === 'json') {
    console.log(jsonReport(result));
  } else {
    console.log(textReport(result));
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
