import { MobileDocsBar } from '@vercel/geistdocs/mobile-docs-bar';
import { createDocsPage } from '@vercel/geistdocs/pages/docs';
import { getMDXComponents } from '@/components/ai-docs/mdx-components';
import { config } from '@/lib/ai-docs/config';
import type {
  cookbookSource,
  aiDocsSource,
  providersSource,
} from '@/lib/ai-docs/source';

type FamilySource =
  | typeof aiDocsSource
  | typeof providersSource
  | typeof cookbookSource;

/**
 * Native thin adapter around `createDocsPage`.
 *
 * The three content families (docs / providers / cookbook) share one renderer;
 * each `[[...slug]]/page.tsx` stays a 5-line adapter that passes its source.
 * Keeps `MobileDocsBar`, link-aware MDX components, and OG images consistent.
 */
export const createFamilyDocsPage = (source: FamilySource) => {
  const page = createDocsPage({
    config,
    mdx: ({ link }) => getMDXComponents({ a: link }),
    openGraph: {
      images: true,
    },
    source,
    tableOfContentPopover: {
      enabled: false,
    },
    renderTop: ({ data }) => <MobileDocsBar toc={data.toc} />,
  });

  return page;
};
