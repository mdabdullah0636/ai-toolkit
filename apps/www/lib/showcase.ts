export interface ShowcaseItem {
  name: string;
  description: string;
  tag: string;
  url: string;
  featured?: boolean;
}

export const showcaseItems: ShowcaseItem[] = [
  {
    name: 'Dub',
    description:
      'The modern link management platform with AI workflows built on the AI TOOLKIT.',
    tag: 'Platform',
    url: 'https://dub.co',
    featured: true,
  },
  {
    name: 'Cal.com Agent',
    description:
      'Schedule meetings through a conversational interface powered by AI.',
    tag: 'Agent',
    url: 'https://cal.com',
    featured: true,
  },
  {
    name: 'Replit Agent',
    description:
      'Turn ideas into software with an autonomous coding agent. Built on the AI TOOLKIT.',
    tag: 'Coding',
    url: 'https://replit.com',
    featured: true,
  },
  {
    name: 'OpenCode',
    description:
      'An open-source AI coding agent that ships code. Uses the AI TOOLKIT for its agent runtime.',
    tag: 'Coding',
    url: 'https://opencode.ai',
    featured: true,
  },
  {
    name: 'Perplexity',
    description:
      'The answer engine that streams grounded, sourced responses in real time.',
    tag: 'Search',
    url: 'https://perplexity.ai',
  },
  {
    name: 'Synthesia',
    description:
      'Generate studio-quality AI video avatars from plain text scripts.',
    tag: 'Video',
    url: 'https://synthesia.io',
  },
  {
    name: 'Mem0',
    description:
      'A memory layer for AI agents that remembers user preferences across sessions.',
    tag: 'Memory',
    url: 'https://mem0.ai',
  },
  {
    name: '11x',
    description:
      'AI voice agents for outbound and inbound sales conversations.',
    tag: 'Voice',
    url: 'https://11x.ai',
  },
  {
    name: 'Langfuse',
    description:
      'Open-source LLM engineering platform for tracing, evals, and prompts.',
    tag: 'Observability',
    url: 'https://langfuse.com',
  },
  {
    name: 'Turborepo',
    description:
      'Monorepo tooling with an AI assistant that helps you migrate and maintain builds.',
    tag: 'DevTools',
    url: 'https://turborepo.dev',
  },
  {
    name: 'Chatbot UI',
    description:
      'A popular open-source chat interface that ships a production-ready AI chat UX.',
    tag: 'Chat',
    url: 'https://github.com/mckaywrigley/chatbot-ui',
  },
  {
    name: 'LangChain',
    description:
      'The framework for building context-aware, reasoning applications, now with AI TOOLKIT support.',
    tag: 'Framework',
    url: 'https://www.langchain.com',
  },
];

export function getShowcaseItems(): ShowcaseItem[] {
  return showcaseItems;
}
