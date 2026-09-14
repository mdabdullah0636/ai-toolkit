import { createLlmsRoute } from '@vercel/geistdocs/routes/llms';
import { sources } from '@/lib/ai-docs/source';

export const { GET } = createLlmsRoute({
  sources,
});
