#!/usr/bin/env node

/**
 * Validates <PropertiesTable> usage in MDX documentation files.
 *
 * Checks:
 *   - Each PropertiesTable has a `content` prop
 *   - Each parameter has required fields: name, type, description
 *   - name/type/description are non-empty strings
 *   - isOptional is boolean when present
 *   - Nested `properties` follow the same structure recursively
 *   - No duplicate parameter names within a single PropertiesTable
 *
 * Run with: pnpm verify-properties-tables
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CONTENT_DIR = path.join(ROOT, 'content', 'docs');

const errors = [];
const warnings = [];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return undefined;
  }
}

function evaluateExpression(expr) {
  try {
    const fn = new Function(`return ${expr}`);
    return { value: fn(), error: null };
  } catch (e) {
    return { value: null, error: e.message };
  }
}

function extractContentProp(mdxText, startPos) {
  const contentMarker = 'content={';
  const markerIndex = mdxText.indexOf(contentMarker, startPos);
  if (markerIndex === -1) return null;

  let braceDepth = 0;
  let i = markerIndex + contentMarker.length;
  const len = mdxText.length;

  while (i < len) {
    const ch = mdxText[i];
    if (ch === '{') {
      braceDepth++;
    } else if (ch === '}') {
      if (braceDepth === 0) {
        const expr = mdxText.slice(markerIndex + contentMarker.length, i).trim();
        return { expression: expr, endPos: i + 1 };
      }
      braceDepth--;
    }
    i++;
  }
  return null;
}

function findPropertiesTables(mdxText, filePath) {
  const tables = [];
  let searchPos = 0;
  const len = mdxText.length;

  while (searchPos < len) {
    const openIndex = mdxText.indexOf('<PropertiesTable', searchPos);
    if (openIndex === -1) break;

    const selfCloseIndex = mdxText.indexOf('/>', openIndex);
    const nextOpenIndex = mdxText.indexOf('<PropertiesTable', openIndex + 1);

    let closeIndex;
    if (selfCloseIndex !== -1 && (nextOpenIndex === -1 || selfCloseIndex < nextOpenIndex)) {
      closeIndex = selfCloseIndex + 2;
    } else {
      const endTagIndex = mdxText.indexOf('</PropertiesTable>', openIndex);
      if (endTagIndex === -1) {
        tables.push({ filePath, line: mdxText.slice(0, openIndex).split('\n').length, error: 'Unclosed PropertiesTable tag' });
        break;
      }
      closeIndex = endTagIndex + '</PropertiesTable>'.length;
    }

    const block = mdxText.slice(openIndex, closeIndex);
    tables.push({ filePath, openIndex, block, line: mdxText.slice(0, openIndex).split('\n').length });

    searchPos = closeIndex;
  }

  return tables;
}

function validateParameter(param, path, tableLine, filePath) {
  if (typeof param !== 'object' || param === null) {
    errors.push(`${filePath}:${tableLine} Parameter at ${path} is not an object`);
    return;
  }

  if (typeof param.name !== 'string' || param.name.trim() === '') {
    errors.push(`${filePath}:${tableLine} Parameter at ${path} has missing or empty 'name'`);
  }

  if (typeof param.type !== 'string' || param.type.trim() === '') {
    errors.push(`${filePath}:${tableLine} Parameter at ${path} has missing or empty 'type'`);
  }

  if (typeof param.description !== 'string' || param.description.trim() === '') {
    errors.push(`${filePath}:${tableLine} Parameter at ${path} has missing or empty 'description'`);
  }

  if (param.isOptional !== undefined && typeof param.isOptional !== 'boolean') {
    errors.push(`${filePath}:${tableLine} Parameter '${param.name ?? path}' at ${path} has non-boolean 'isOptional'`);
  }

  if (param.properties !== undefined) {
    if (!Array.isArray(param.properties)) {
      errors.push(`${filePath}:${tableLine} Parameter '${param.name ?? path}' at ${path} has non-array 'properties'`);
    } else {
      for (let i = 0; i < param.properties.length; i++) {
        const prop = param.properties[i];
        const propPath = `${path}[${param.name ?? i}].properties[${i}]`;
        if (typeof prop !== 'object' || prop === null) {
          errors.push(`${filePath}:${tableLine} Property at ${propPath} is not an object`);
          continue;
        }
        if (typeof prop.type !== 'string' || prop.type.trim() === '') {
          errors.push(`${filePath}:${tableLine} Property at ${propPath} has missing or empty 'type'`);
        }
        if (!Array.isArray(prop.parameters)) {
          errors.push(`${filePath}:${tableLine} Property '${prop.type ?? i}' at ${propPath} has missing or non-array 'parameters'`);
        } else {
          for (let j = 0; j < prop.parameters.length; j++) {
            validateParameter(prop.parameters[j], `${propPath}.parameters[${j}]`, tableLine, filePath);
          }
        }
      }
    }
  }
}

function validateTable(table) {
  if (table.error) {
    errors.push(`${table.filePath}:${table.line} ${table.error}`);
    return;
  }

  const result = extractContentProp(table.block, 0);
  if (!result) {
    errors.push(`${table.filePath}:${table.line} PropertiesTable missing 'content' prop`);
    return;
  }

  const { value: content, error: evalError } = evaluateExpression(result.expression);
  if (evalError) {
    errors.push(`${table.filePath}:${table.line} Cannot evaluate content expression: ${evalError}`);
    return;
  }

  if (!Array.isArray(content)) {
    errors.push(`${table.filePath}:${table.line} PropertiesTable 'content' is not an array`);
    return;
  }

  const names = new Set();
  for (let i = 0; i < content.length; i++) {
    const param = content[i];
    const path = `[${i}]`;

    if (param.name && typeof param.name === 'string') {
      if (names.has(param.name)) {
        errors.push(`${table.filePath}:${table.line} Duplicate parameter name '${param.name}' at ${path}`);
      }
      names.add(param.name);
    }

    validateParameter(param, path, table.line, table.filePath);
  }
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`Content directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }

  const mdxFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.mdx')) {
        mdxFiles.push(full);
      }
    }
  }
  walk(CONTENT_DIR);

  let tablesFound = 0;
  for (const file of mdxFiles) {
    const text = fs.readFileSync(file, 'utf8');
    const tables = findPropertiesTables(text, path.relative(ROOT, file));
    for (const table of tables) {
      tablesFound++;
      validateTable(table);
    }
  }

  console.log('\nProperties Table Validation\n');
  console.log(`MDX files scanned: ${mdxFiles.length}`);
  console.log(`PropertiesTables found: ${tablesFound}\n`);

  if (errors.length) {
    console.log('Errors:');
    errors.forEach(e => console.log(`  - ${e}`));
  }
  if (warnings.length) {
    console.log('\nWarnings:');
    warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (errors.length) {
    console.log(`\n${errors.length} issue(s) found.`);
    process.exit(1);
  } else {
    console.log('✅ All properties tables passed validation.');
  }
}

main();
