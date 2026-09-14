import { redirect } from 'next/navigation';
import { getPublicPath } from '@vercel/geistdocs/config';
import { config } from '@/lib/ai-docs/config';

// The site root redirects to the docs index; the navbar wordmark also targets
// /docs (via `logoHref`) so visitors stay on the documentation.
const Home = async () => {
  redirect(getPublicPath('/docs', config.basePath));
};

export default Home;
