import { platformRegistry } from './platform';

export interface Tool {
  slug: string;
  name: string;
  description: string;
  packageName: string;
  tags?: string[];
  apiKeyEnvName?: string;
  installCommand: Record<'pnpm' | 'npm' | 'yarn' | 'bun', string>;
  codeExample: string;
  docsUrl?: string;
  apiKeyUrl?: string;
  websiteUrl?: string;
  npmUrl?: string;
}

function getTools(): Tool[] {
  return platformRegistry.all({ type: 'tool' }).map(record => {
    if (record.type !== 'tool') throw new Error('Expected tool record');
    const links = Object.fromEntries(
      record.links.map(link => [link.label, link.href]),
    );
    return {
      slug: record.slug,
      name: record.name,
      description: record.description,
      packageName: record.packageName,
      tags: record.tags,
      installCommand: record.installCommands,
      codeExample: record.codeExample,
      docsUrl: links.docs,
      apiKeyUrl: links.apiKey,
      websiteUrl: links.website,
      npmUrl: links.npm,
    };
  });
}

export const tools = getTools();

export function getToolTags(): string[] {
  return Array.from(new Set(tools.flatMap(tool => tool.tags ?? []))).sort(
    (a, b) => a.localeCompare(b),
  );
}
