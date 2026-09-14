import { defineConfig } from '@vercel/geistdocs/config';
import {
  agent,
  ai,
  basePath,
  github,
  Logo,
  nav,
  prompt,
  siteId,
  suggestions,
  title,
  translations,
} from '@/ai-docs';
import { isSiteUrlConfigured, siteUrl } from './site-url';

export const config = defineConfig({
  title,
  agent,
  defaultLanguage: 'en',
  logo: <Logo />,
  logoHref: '/docs',
  github,
  basePath,
  siteId,
  siteUrl: isSiteUrlConfigured ? siteUrl.toString() : undefined,
  translations,
  nav,
  content: [
    { id: 'docs', label: 'Docs', dir: 'content/docs', route: '/docs' },
    {
      id: 'providers',
      label: 'Providers',
      dir: 'content/providers',
      route: '/providers',
    },
    {
      id: 'cookbook',
      label: 'Cookbook',
      dir: 'content/cookbook',
      route: '/cookbook',
    },
  ],
  ai: {
    prompt,
    suggestions,
    ...ai,
  },
});
