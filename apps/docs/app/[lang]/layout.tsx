import '../global.css';
import '@/lib/ai-docs/site-url-warning';
import { Footer } from '@vercel/geistdocs/footer';
import { Navbar } from '@vercel/geistdocs/navbar';
import type { Metadata } from 'next';
import { AiDocsProvider } from '@/components/ai-docs/provider';
import { config } from '@/lib/ai-docs/config';
import { mono, sans } from '@/lib/ai-docs/fonts';
import { i18n } from '@/lib/ai-docs/i18n';
import { getRootLang } from '@/lib/ai-docs/root-params';
import { isSiteUrlConfigured, siteUrl } from '@/lib/ai-docs/site-url';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export const generateStaticParams = () =>
  i18n.languages.map(lang => ({ lang }));

export const metadata: Metadata = {
  metadataBase: isSiteUrlConfigured ? siteUrl : undefined,
};

const Layout = async ({ children }: { children: ReactNode }) => {
  const lang = await getRootLang();

  return (
    <html
      className={cn(sans.variable, mono.variable, 'antialiased')}
      lang={lang}
      suppressHydrationWarning
    >
      <body>
        <AiDocsProvider basePath={config.basePath} lang={lang}>
          <Navbar config={config} />
          {children}
          <Footer />
        </AiDocsProvider>
      </body>
    </html>
  );
};

export default Layout;
