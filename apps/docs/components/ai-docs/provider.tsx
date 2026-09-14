'use client';

import { Analytics } from '@vercel/analytics/next';
import { GeistdocsProvider as PackageProvider } from '@vercel/geistdocs/layout';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { ComponentProps } from 'react';
import { config } from '@/lib/ai-docs/config';

type AiDocsProviderProps = Omit<
  ComponentProps<typeof PackageProvider>,
  'config'
> & {
  basePath: string | undefined;
  className?: string;
  lang?: string;
};

export const AiDocsProvider = ({
  basePath: _basePath,
  className: _className,
  lang,
  ...props
}: AiDocsProviderProps) => {
  return (
    <>
      <PackageProvider config={config} lang={lang} {...props} />
      <Analytics />
      <SpeedInsights />
    </>
  );
};
