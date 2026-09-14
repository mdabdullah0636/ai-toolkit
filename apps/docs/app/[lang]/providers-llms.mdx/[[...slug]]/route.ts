import { createDocsMarkdownRoute } from '@vercel/geistdocs/routes/llms';
import { providersSource } from '@/lib/ai-docs/source';

const route = createDocsMarkdownRoute({
  sources: [providersSource],
});

export const GET = route.GET;

// Wrapped so the export satisfies Next's strict route-type validators
// (the factory types its params argument as optional).
export const generateStaticParams = (context: {
  params: { lang: string; slug?: string[] };
}) => route.generateStaticParams({ params: Promise.resolve(context.params) });
