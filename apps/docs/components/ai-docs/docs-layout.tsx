import { GeistdocsDocsLayout as PackageDocsLayout } from '@vercel/geistdocs/layout';
import type { ComponentProps, ReactNode } from 'react';
import { config } from '@/lib/ai-docs/config';

interface DocsLayoutProps {
  children: ReactNode;
  tree: ComponentProps<typeof PackageDocsLayout>['tree'];
}

export const DocsLayout = ({ tree, children }: DocsLayoutProps) => (
  <PackageDocsLayout
    config={config}
    containerProps={{
      className: 'mx-auto max-w-[1448px] bg-background-200',
    }}
    sidebarMode="sections"
    tree={tree}
  >
    {children}
  </PackageDocsLayout>
);
