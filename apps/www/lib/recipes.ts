import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const COOKBOOK_ROOT = join(process.cwd(), '../../content/cookbook');

export interface Category {
  id: string;
  title: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: 'guides',
    title: 'Guides',
    description: 'Use-case specific guides to build real AI applications.',
  },
  {
    id: 'next',
    title: 'Next.js',
    description: 'Recipes for building AI features with Next.js.',
  },
  {
    id: 'node',
    title: 'Node.js',
    description: 'Framework-agnostic recipes for Node.js servers and scripts.',
  },
  {
    id: 'api-servers',
    title: 'API Servers',
    description: 'Stream text, objects, and tools from HTTP servers.',
  },
  {
    id: 'rsc',
    title: 'React Server Components',
    description: 'Stream generative UI directly from server components.',
  },
];

export const categoryByDir: Record<string, string> = {
  '00-guides': 'guides',
  '01-next': 'next',
  '05-node': 'node',
  '15-api-servers': 'api-servers',
  '20-rsc': 'rsc',
};

export interface CodeBlock {
  language: string;
  filename?: string;
  code: string;
}

export interface RecipeSection {
  heading: string;
  content: string[];
  codeBlocks: CodeBlock[];
}

export interface RecipeMeta {
  slug: string;
  category: string;
  categoryTitle: string;
  title: string;
  description: string;
  tags: string[];
  readTime: number;
  filename: string;
}

export interface Recipe extends RecipeMeta {
  intro: string;
  sections: RecipeSection[];
  introCodeBlocks: CodeBlock[];
  sourcePath: string;
}

interface Frontmatter {
  title?: string;
  description?: string;
  tags?: string[];
}

function parseFrontmatter(source: string): { meta: Frontmatter; body: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return { meta: {}, body: source };

  const raw = match[1];
  const meta: Frontmatter = {};

  const title = raw.match(/^title:\s*(.+)$/m);
  if (title) meta.title = title[1].trim().replace(/^['"]|['"]$/g, '');

  const description = raw.match(/^description:\s*(.+)$/m);
  if (description)
    meta.description = description[1].trim().replace(/^['"]|['"]$/g, '');

  const tags = raw.match(/^tags:\s*\[([^\]]*)\]/m);
  if (tags)
    meta.tags = tags[1]
      .split(',')
      .map(tag => tag.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);

  return { meta, body: source.slice(match[0].length) };
}

function extractCodeBlocks(body: string): {
  blocks: { language: string; filename?: string; code: string }[];
  remaining: string;
} {
  const blocks: { language: string; filename?: string; code: string }[] = [];
  const pattern = /```([\w+-]*)([^\n]*)\n([\s\S]*?)```/g;
  const remaining = body.replace(pattern, (_all, language, attrs, code) => {
    const filenameMatch = attrs.match(
      /(?:filename|file)=(?:"([^"]+)"|'([^']+)')/,
    );
    blocks.push({
      language: (language || 'ts').trim(),
      filename: filenameMatch?.[1] ?? filenameMatch?.[2],
      code: code.trimEnd(),
    });
    return '';
  });
  return { blocks, remaining };
}

function extractSections(body: string): {
  intro: string;
  sections: RecipeSection[];
} {
  const lines = body.split('\n');
  const introLines: string[] = [];
  const sections: RecipeSection[] = [];
  let current: RecipeSection | null = null;
  let currentContent: string[] = [];

  const flushContent = () => {
    if (current) {
      current.content = currentContent.filter(line => line.trim() !== '');
      sections.push(current);
      currentContent = [];
    }
  };

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)$/);
    if (headingMatch) {
      flushContent();
      current = {
        heading: headingMatch[1].trim(),
        content: [],
        codeBlocks: [],
      };
    } else if (current === null) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#')) continue;
      if (trimmed.startsWith('<')) continue;
      if (trimmed === '') continue;
      introLines.push(trimmed);
    } else {
      currentContent.push(line);
    }
  }
  flushContent();

  return { intro: introLines.join('\n').trim(), sections };
}

function slugify(filename: string): string {
  return filename.replace(/\.mdx$/, '').replace(/^\d+-/, '');
}

function estimateReadTime(source: string): number {
  const words = source.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function getCategoriesWithCounts(): (Category & { count: number })[] {
  return categories.map(category => ({
    ...category,
    count: getRecipesByCategory(category.id).length,
  }));
}

function recipeFiles(categoryId: string): { dir: string; files: string[] }[] {
  return Object.entries(categoryByDir)
    .filter(([, id]) => id === categoryId)
    .map(([dir]) => {
      const dirPath = join(COOKBOOK_ROOT, dir);
      const files = readdirSync(dirPath)
        .filter(file => file.endsWith('.mdx') && file !== 'index.mdx')
        .sort();
      return { dir, files };
    });
}

function parseRecipeFile(dir: string, file: string): Recipe {
  const fullPath = join(COOKBOOK_ROOT, dir, file);
  const source = readFileSync(fullPath, 'utf8');
  const { meta, body } = parseFrontmatter(source);
  const category = categoryByDir[dir] ?? 'guides';
  const categoryTitle = categories.find(c => c.id === category)?.title ?? '';

  const slug = slugify(file);

  return {
    slug,
    category,
    categoryTitle,
    title: meta.title ?? slug,
    description: meta.description ?? '',
    tags: meta.tags ?? [],
    readTime: estimateReadTime(body),
    filename: file,
    intro: extractSections(body)
      .intro.split('\n')
      .filter(line => !line.trim().startsWith('```'))
      .join(' ')
      .trim(),
    sections: [],
    introCodeBlocks: [],
    sourcePath: fullPath,
  };
}

export function getRecipesByCategory(categoryId: string): RecipeMeta[] {
  return recipeFiles(categoryId)
    .flatMap(({ dir, files }) => files.map(file => parseRecipeFile(dir, file)))
    .map(
      ({
        slug,
        category,
        categoryTitle,
        title,
        description,
        tags,
        readTime,
        filename,
      }) => ({
        slug,
        category,
        categoryTitle,
        title,
        description,
        tags,
        readTime,
        filename,
      }),
    );
}

export function getAllRecipes(): RecipeMeta[] {
  return categories.flatMap(category => getRecipesByCategory(category.id));
}

export function getRecipe(
  categoryId: string,
  slug: string,
): Recipe | undefined {
  const entries = recipeFiles(categoryId);
  for (const { dir, files } of entries) {
    const file = files.find(f => slugify(f) === slug);
    if (file) {
      const fullPath = join(COOKBOOK_ROOT, dir, file);
      const source = readFileSync(fullPath, 'utf8');
      const { meta, body } = parseFrontmatter(source);
      const { intro, sections } = extractSections(body);

      const normalizedSections = sections
        .map(section => {
          const { blocks } = extractCodeBlocks(section.content.join('\n'));
          return {
            heading: section.heading,
            content: section.content.filter(
              line => !line.trim().startsWith('```'),
            ),
            codeBlocks: blocks,
          };
        })
        .filter(
          section =>
            section.codeBlocks.length > 0 || section.content.length > 0,
        );

      const introBlocks = extractCodeBlocks(intro).blocks;
      const cleanIntro = intro
        .split('\n')
        .filter(line => !line.trim().startsWith('```'))
        .join(' ')
        .trim();

      const category = categoryByDir[dir] ?? 'guides';

      return {
        slug,
        category,
        categoryTitle: categories.find(c => c.id === category)?.title ?? '',
        title: meta.title ?? slug,
        description: meta.description ?? '',
        tags: meta.tags ?? [],
        readTime: estimateReadTime(body),
        filename: file,
        intro: cleanIntro,
        sections: normalizedSections,
        sourcePath: `https://github.com/khulnasoft/ai-toolkit/blob/main/content/cookbook/${dir}/${file}`,
        introCodeBlocks: introBlocks,
      };
    }
  }
  return undefined;
}

export function getAllRecipePaths(): { category: string; slug: string }[] {
  return categories.flatMap(category =>
    getRecipesByCategory(category.id).map(recipe => ({
      category: recipe.category,
      slug: recipe.slug,
    })),
  );
}
