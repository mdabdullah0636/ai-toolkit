import type {
  GeistdocsAgentReadinessConfig,
  GeistdocsAIConfig,
} from '@vercel/geistdocs/config';

export const Logo = () => (
  <span className="font-semibold text-gray-1000 text-lg leading-none tracking-[-3%]">
    AI <span className="font-normal text-gray-900">TOOL&shy;KIT</span>
  </span>
);

export const github = {
  branch: 'main',
  editPath: 'apps/docs/content/{path}',
  owner: 'xeondesk',
  repo: 'ai-toolkit',
};

export const nav = [
  {
    label: 'Docs',
    href: '/docs',
  },
  {
    label: 'Cookbook',
    href: '/cookbook',
  },
  {
    label: 'Providers',
    href: '/providers',
  },
  {
    label: 'Source',
    href: `https://github.com/${github.owner}/${github.repo}/`,
  },
];

export const suggestions = [
  'What is the AI TOOLKIT?',
  'How do I stream text responses?',
  'How do I generate structured objects?',
  'What is tool usage?',
];

export const title = 'AI TOOLKIT Documentation';

export const prompt =
  'You are a helpful assistant specializing in answering questions about the AI TOOLKIT, the TypeScript SDK for building AI-powered applications with Large Language Models.';

export const ai = {
  footer: (
    <div className="text-right">
      <a href={`https://github.com/${github.owner}/${github.repo}`}>
        Open Source · Apache-2.0
      </a>
    </div>
  ),
} satisfies GeistdocsAIConfig;

export const agent = {
  product: {
    name: 'AI TOOLKIT',
    description:
      'AI TOOLKIT is a TypeScript/JavaScript SDK for building AI-powered applications with Large Language Models. It provides a unified interface for multiple AI providers and framework integrations.',
    category: 'Documentation',
    audience: ['Software engineers', 'AI product developers'],
    useCases: [
      'Build AI-powered applications with a unified provider interface',
      'Stream text, objects, and images from large language models',
      'Integrate AI capabilities into React, Vue, Svelte, and Angular apps',
    ],
  },
  links: [
    {
      label: 'AI TOOLKIT source',
      href: `https://github.com/${github.owner}/${github.repo}`,
      description: 'Source repository for the AI TOOLKIT SDK',
    },
  ],
} satisfies GeistdocsAgentReadinessConfig;

export const translations = {
  en: {
    displayName: 'English',
  },
};

export const basePath: string | undefined = undefined;

/**
 * Unique identifier for this site, used in markdown request tracking analytics.
 */
export const siteId = 'ai-toolkit-docs';
