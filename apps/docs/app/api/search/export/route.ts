import { createSearchExportRoute } from '@vercel/geistdocs/routes/search-export';
import { config } from '@/lib/ai-docs/config';
import { sources } from '@/lib/ai-docs/source';

export const { GET } = createSearchExportRoute({
  config,
  sources,
});
