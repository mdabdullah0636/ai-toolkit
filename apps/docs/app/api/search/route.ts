import { createSearchRoute } from '@vercel/geistdocs/routes/search';
import { config } from '@/lib/ai-docs/config';
import { sources } from '@/lib/ai-docs/source';

export const GET = createSearchRoute({ config, sources });
