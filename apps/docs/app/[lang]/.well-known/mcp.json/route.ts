import { createMcpManifestRoute } from '@vercel/geistdocs/routes/mcp';
import { config } from '@/lib/ai-docs/config';

export const { GET, generateStaticParams } = createMcpManifestRoute({
  config,
});
