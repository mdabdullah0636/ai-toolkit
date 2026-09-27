#!/usr/bin/env node
/**
 * One-time normalization of apps/docs/content into its final served form.
 *
 * Mirrors upstream vercel/ai `apps/docs/scripts/sync-content*.mjs`, which
 * generates its content dir from numbered sources at build time. This fork
 * commits content directly, so the transforms are applied in place, once:
 *
 *   1. Strips `NN-` numeric prefixes from every path segment.
 *   2. Generates a meta.json per directory, ordered by the original numeric
 *      prefixes. Folders whose index.mdx frontmatter has `collapsed: true`
 *      get `defaultOpen: false`.
 *   3. Strips the first in-body `# H1` (AiDocs renders the frontmatter
 *      title as the page heading).
 *   4. Rewrites code-fence meta: `filename="x"` -> `title="x"` and
 *      `highlight="1,3-5"` -> `{1,3-5}` (transformerMetaHighlight).
 *   5. Remaps fence languages Shiki doesn't bundle (`env` -> `dotenv`,
 *      `prompt`/`rego` -> `txt`) and drops top-level MDX imports.
 *   6. Drops index.mdx when an overview sibling exists or the body is empty,
 *      keeping the index title on the folder.
 *
 * Convention going forward: author content WITHOUT numeric prefixes and
 * re-run this script after adding files (it is idempotent for clean trees).
 */

import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const families = ['docs', 'providers', 'cookbook'];

/** Returns { prefix, clean } for a `NN-name` path segment. */
const parseSegment = segment => {
  const match = segment.match(/^(\d+)-(.+)$/);
  return match ? { prefix: Number(match[1]), clean: match[2] } : { prefix: null, clean: segment };
};

/** Strips the first in-body `# H1` line (frontmatter title is the page H1). */
const stripLeadingH1 = mdx => {
  const fmMatch = mdx.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  const fmEnd = fmMatch ? fmMatch[0].length : 0;
  const body = mdx.slice(fmEnd);
  const stripped = body.replace(/^\s*#[ \t][^\n]*\n?/, '\n');
  return mdx.slice(0, fmEnd) + stripped;
};

const linkReplacements = [
  ['#ui-message-stream-protocol', '#data-stream-protocol'],
  ['#ui-message-stream', '#ui-message-stream-example'],
  ['#multi-modal-messages', '#file-parts'],
  ['#validating-messages-from-database', '#validating-messages-on-the-server'],
  ['#multi-step-calls', '#multi-step-calls-using-stopwhen'],
  ['#attachments-experimental', '#attachments'],
  ['#structured-outputs-with-generatetext-and-streamtext', '#generating-structured-outputs'],
  ['#simulate-data-stream-protocol-responses', '#simulate-ui-message-stream-responses'],
  ['#tools-generate', '#tools.tool.generate'],
  ['#tooloopagent-class', '#toolloopagent-class'],
];

const rewriteLegacyLinks = line =>
  linkReplacements.reduce((rewritten, [from, to]) => {
    if (to.startsWith(from)) {
      const suffix = to.slice(from.length).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(
        `${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!${suffix})`,
        'g',
      );
      return rewritten.replace(pattern, to);
    }
    return rewritten.replaceAll(from, to);
  }, line);

/** Rewrites code fence meta to fumadocs conventions and drops top-level MDX imports. */
const rewriteLines = mdx => {
  let inFence = false;

  return mdx
    .split('\n')
    .map(line => {
      if (line.trimStart().startsWith('```')) {
        inFence = !inFence;
        let next = line.replace(
          /\b(?:filename|file)=(?:\{)?(["'])([^"']+)\1(?:\})?/g,
          'title=$1$2$1',
        );
        next = next.replace(/\bhighlight=(?:\{)?(["'])([^"']+)\1(?:\})?/g, '{$2}');
        next = next.replace(/^(\s*```)([a-zA-Z-]+)["']+(\s*)$/, '$1$2$3');
        next = next.replace(/^(\s*```)prompt\b/, '$1txt');
        next = next.replace(/^(\s*```)env\b/, '$1dotenv');
        next = next.replace(/^(\s*```)rego\b/, '$1txt');
        return next;
      }
      if (!inFence && /^import\s/.test(line)) {
        return null;
      }
      const rewrittenLine = !inFence ? rewriteLegacyLinks(line) : line;
      if (!inFence && /^#{1,6}\s/.test(rewrittenLine) && /<[A-Z]/.test(rewrittenLine)) {
        return rewrittenLine
          .replace(/<([A-Z][\w.]*)[^>]*>([^<]*)<\/\1>/g, '($2)')
          .replace(/<[A-Z][\w.]*[^>]*\/>/g, '')
          .trimEnd();
      }
      return rewrittenLine;
    })
    .filter(line => line !== null)
    .join('\n');
};

const addLegacyAnchors = mdx => {
  const title = mdx.match(/^---\r?\n[\s\S]*?^title:\s*(.+)$/m)?.[1]?.trim();

  if (title === 'streamText') {
    return mdx.replace(
      '\n### Returns',
      '\n<span id="result" />\n<span id="result-object" />\n\n### Returns',
    );
  }
  if (title === 'Output') {
    return mdx.replace(
      '\n### `Output.object()`',
      '\n<span id="output-object" />\n\n### `Output.object()`',
    );
  }
  if (title === 'Telemetry') {
    const frontmatter = mdx.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
    const offset = frontmatter?.[0].length ?? 0;
    return `${mdx.slice(0, offset)}\n<span id="telemetry" />\n${mdx.slice(offset)}`;
  }
  return mdx;
};

const transformMdx = mdx => addLegacyAnchors(stripLeadingH1(rewriteLines(mdx)));

const frontmatterOf = mdx => {
  const match = mdx.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  return match ? match[1] : '';
};

const bodyOf = mdx => {
  const match = mdx.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return mdx.slice(match ? match[0].length : 0);
};

const titleOf = mdx => {
  const raw = frontmatterOf(mdx)
    .match(/^title:\s*(.+)$/m)?.[1]
    ?.trim();
  return raw?.replace(/^(['"])(.*)\1$/, '$2');
};

const transformDir = (srcDir, outDir, relPath = '') => {
  mkdirSync(outDir, { recursive: true });

  const entries = readdirSync(srcDir, { withFileTypes: true })
    .filter(entry => !entry.name.startsWith('.') && entry.name !== 'meta.json')
    .map(entry => {
      const { prefix, clean } = parseSegment(
        entry.isDirectory() ? entry.name : entry.name.replace(/\.mdx$/, ''),
      );
      return { entry, prefix, clean };
    })
    .sort(
      (a, b) =>
        (a.prefix ?? Number.MAX_SAFE_INTEGER) - (b.prefix ?? Number.MAX_SAFE_INTEGER) ||
        a.clean.localeCompare(b.clean),
    );

  const hasOverviewPage = entries.some(
    ({ entry, clean }) =>
      !entry.isDirectory() && entry.name.endsWith('.mdx') && clean === 'overview',
  );

  const seen = new Map();
  const pages = [];
  let defaultOpen;
  let folderTitle;

  for (const { entry, clean } of entries) {
    const srcPath = join(srcDir, entry.name);

    if (seen.has(clean)) {
      throw new Error(
        `prefix-strip collision in ${relPath || '.'}: "${entry.name}" and "${seen.get(clean)}" both map to "${clean}"`,
      );
    }
    seen.set(clean, entry.name);

    if (entry.isDirectory()) {
      transformDir(srcPath, join(outDir, clean), join(relPath, clean));
      pages.push(clean);
    } else if (entry.name.endsWith('.mdx')) {
      const mdx = readFileSync(srcPath, 'utf8');
      if (clean === 'index' && /^collapsed:\s*true/m.test(frontmatterOf(mdx))) {
        defaultOpen = false;
      }
      if (clean === 'index' && (hasOverviewPage || bodyOf(mdx).trim() === '')) {
        folderTitle = titleOf(mdx);
        continue;
      }
      writeFileSync(join(outDir, `${clean}.mdx`), transformMdx(mdx));
      if (clean !== 'index') {
        pages.push(clean);
      }
    } else {
      cpSync(srcPath, join(outDir, entry.name));
    }
  }

  const meta = { pages };
  if (folderTitle) {
    meta.title = folderTitle;
  }
  if (defaultOpen === false) {
    meta.defaultOpen = false;
  }
  writeFileSync(join(outDir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`);
};

for (const family of families) {
  const srcDir = join(appDir, 'content', family);
  const staging = mkdtempSync(join(tmpdir(), `normalize-${family}-`));
  transformDir(srcDir, join(staging, family), family);
  rmSync(srcDir, { recursive: true, force: true });
  mkdirSync(join(appDir, 'content'), { recursive: true });
  cpSync(join(staging, family), srcDir, { recursive: true });
  rmSync(staging, { recursive: true, force: true });
  console.log(`[normalize-content] transformed ${family}`);
}

console.log('[normalize-content] done');
