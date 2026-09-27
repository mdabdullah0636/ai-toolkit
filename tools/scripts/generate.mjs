#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const TEMPLATES_DIR = path.join(ROOT, 'tools', 'templates');

const args = process.argv.slice(2);
const type = args[0];
const nameArg = args.find(a => a.startsWith('--name='));
const name = nameArg ? nameArg.split('=')[1] : null;

function showHelp() {
  console.log(`
Usage: pnpm generate <type> --name=<name>

Types:
  provider       Generate a new provider package
  adapter        Generate a new framework adapter
  example        Generate a new example

Examples:
  pnpm generate provider --name=my-provider
  pnpm generate adapter --framework=react
  pnpm generate example --level=01-foundations --name=my-example
`);
}

if (!type || !name || type === '--help' || type === '-h') {
  showHelp();
  process.exit(type ? 0 : 1);
}

const generators = {
  async provider() {
    // Canonical provider scaffolding lives in tools/create-ai-provider.
    // This branch forwards so `pnpm generate provider` keeps working.
    const { spawn } = await import('child_process');
    const createScript = path.join(ROOT, 'tools', 'create-ai-provider', 'src', 'index.js');
    const child = spawn(process.execPath, [createScript, name, '--no-install'], {
      stdio: 'inherit',
    });
    child.on('exit', code => process.exit(code ?? 1));
  },

  adapter() {
    const targetDir = path.join(ROOT, 'packages', 'adapters', name);
    if (fs.existsSync(targetDir)) {
      console.error(`❌ Adapter "${name}" already exists at packages/adapters/${name}`);
      process.exit(1);
    }
    fs.mkdirSync(path.join(targetDir, 'src'), { recursive: true });
    fs.mkdirSync(path.join(targetDir, 'tests'), { recursive: true });

    fs.writeFileSync(
      path.join(targetDir, 'package.json'),
      JSON.stringify(
        {
          name: `@ai-toolkit/${name}`,
          version: '0.0.1',
          private: false,
          type: 'module',
          scripts: {
            build: 'tsup',
            test: 'vitest',
            'type-check': 'tsc --noEmit',
          },
          peerDependencies: {
            '@ai-toolkit/core': 'workspace:*',
          },
        },
        null,
        2,
      ) + '\n',
    );

    fs.writeFileSync(
      path.join(targetDir, 'src', 'index.ts'),
      `// ${name} adapter
// TODO: Implement framework-specific wrappers
`,
    );

    console.log(`✅ Created adapter at packages/adapters/${name}`);
  },

  example() {
    const levelArg = args.find(a => a.startsWith('--level='));
    const level = levelArg ? levelArg.split('=')[1] : '01-foundations';
    const categoryOrder = parseInt(level.split('-')[0], 10) || 1;

    const targetDir = path.join(ROOT, 'examples', level, name);
    if (fs.existsSync(targetDir)) {
      console.error(`❌ Example "${name}" already exists at examples/${level}/${name}`);
      process.exit(1);
    }
    fs.mkdirSync(targetDir, { recursive: true });

    fs.writeFileSync(
      path.join(targetDir, 'example.json'),
      JSON.stringify(
        {
          name,
          title: name,
          category: level,
          categoryOrder,
          framework: '',
          primaryProvider: null,
          description: '',
          tags: [],
        },
        null,
        2,
      ) + '\n',
    );

    fs.writeFileSync(
      path.join(targetDir, 'index.ts'),
      `// ${name} example
// TODO: Implement example
`,
    );

    console.log(`✅ Created example at examples/${level}/${name}`);
  },
};

if (generators[type]) {
  generators[type]();
} else {
  console.error(`❌ Unknown type: "${type}". Use: provider, adapter, or example`);
  showHelp();
  process.exit(1);
}
