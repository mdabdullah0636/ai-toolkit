import { getPublicPath } from '@vercel/geistdocs/config';
import type { MetadataRoute } from 'next';
import { config } from '@/lib/ai-docs/config';
import { absoluteUrl } from '@/lib/ai-docs/site-url';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: absoluteUrl(getPublicPath('/sitemap.xml', config.basePath)),
  };
}
