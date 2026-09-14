import { createGeistdocs } from '@vercel/geistdocs/next';
import type { NextConfig } from 'next';
import { exampleRedirects } from './lib/example-redirects';

const withAiDocs = createGeistdocs();

// Published @vercel/geistdocs installs include prebuilt dist;
// no workspace source transpilation needed.
const inMonorepo = false;

// Distinct favicon per environment; production keeps the default (no-op).
const ENV_FAVICONS = {
  development: '/favicon.development.ico',
  preview: '/favicon.preview.ico',
} as const;

const environment = process.env.VERCEL_ENV ?? process.env.NODE_ENV;
const envFavicon = ENV_FAVICONS[environment as keyof typeof ENV_FAVICONS];

const config: NextConfig = {
  ...(inMonorepo ? { transpilePackages: ['@vercel/geistdocs'] } : {}),
  cacheComponents: true,
  partialPrefetching: true,
  rewrites: () => {
    if (!envFavicon) {
      return Promise.resolve([]);
    }

    return Promise.resolve({
      beforeFiles: [{ source: '/favicon.ico', destination: envFavicon }],
      afterFiles: [],
      fallback: [],
    });
  },
  redirects: () => [
    {
      source: '/docs',
      destination: '/docs/introduction',
      permanent: false,
    },
    // Section landing pages whose index.mdx was folded into an Overview
    // page (see scripts/normalize-content.mjs).
    ...[
      '/docs/foundations',
      '/docs/agents',
      '/docs/ai-toolkit-core',
      '/docs/ai-toolkit-ui',
      '/docs/ai-toolkit-rsc',
    ].map(source => ({
      source,
      destination: `${source}/overview`,
      permanent: true as const,
    })),
    // Cookbook section indexes are frontmatter-only; redirect each section
    // to its first recipe.
    {
      source: '/cookbook/next',
      destination: '/cookbook/next/generate-text',
      permanent: false,
    },
    {
      source: '/cookbook/node',
      destination: '/cookbook/node/generate-text',
      permanent: false,
    },
    {
      source: '/cookbook/rsc',
      destination: '/cookbook/rsc/generate-text',
      permanent: false,
    },
    {
      source: '/cookbook/api-servers',
      destination: '/cookbook/api-servers/node-http-server',
      permanent: false,
    },
    // /examples deep URLs are still linked from docs content; they chain
    // to their cookbook replacements.
    ...exampleRedirects,
  ],
};

export default withAiDocs(config);
