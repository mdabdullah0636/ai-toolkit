import { createNotFoundRoute } from '@vercel/geistdocs/routes/not-found';
import { config } from '@/lib/ai-docs/config';

export const { GET } = createNotFoundRoute({ config });
