import { createSource } from '@vercel/geistdocs/source';
import { cookbook, docs, providers } from '@/.source/server';
import { config } from './config';

export const aiDocsSource = createSource({
  docs,
  config,
});

export const providersSource = createSource({
  docs: providers,
  config,
  baseUrl: '/providers',
});

export const cookbookSource = createSource({
  docs: cookbook,
  config,
  baseUrl: '/cookbook',
});

/** Every source bundle (all content families). */
export const sources = [aiDocsSource, providersSource, cookbookSource];

export const source = aiDocsSource.source;
export const getPageImage = aiDocsSource.getPageImage;
export const getLLMText = aiDocsSource.getPageMarkdown;
