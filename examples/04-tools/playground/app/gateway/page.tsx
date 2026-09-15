'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Globe,
  Key,
  Shield,
  Gauge,
  Plug,
  ArrowRight,
  Check,
  Server,
  Database,
  Activity,
  Lock,
  Eye,
} from 'lucide-react';

const providers = [
  { name: 'OpenAI', color: '#10a37f' },
  { name: 'Anthropic', color: '#d97757' },
  { name: 'Google', color: '#4285f4' },
  { name: 'Azure', color: '#0078d4' },
  { name: 'AWS Bedrock', color: '#ff9900' },
  { name: 'Mistral', color: '#ff7000' },
  { name: 'Cohere', color: '#5959ab' },
  { name: 'DeepSeek', color: '#202123' },
];

const features = [
  {
    icon: Plug,
    title: 'Unified API',
    description:
      'Single integration to access 50+ models across all major providers.',
  },
  {
    icon: Key,
    title: 'Unified API Keys',
    description:
      'Manage all provider API keys in one place. No more scattered credentials.',
  },
  {
    icon: Shield,
    title: 'Unified Security',
    description:
      'Consistent authentication, rate limiting, and access controls across all models.',
  },
  {
    icon: Gauge,
    title: 'Unified Observability',
    description:
      'One dashboard to monitor usage, costs, and latency across every provider.',
  },
  {
    icon: Database,
    title: 'Unified Caching',
    description: 'Reduce costs and latency with intelligent response caching.',
  },
  {
    icon: Activity,
    title: 'Fallback & Retry',
    description: 'Automatic failover to backup providers when one goes down.',
  },
];

const codeExample = `import { generateText } from 'ai-toolkit';
import { gateway } from '@ai-toolkit/gateway';

// Use any model with a single line
const result = await generateText({
  model: gateway('openai/gpt-4o'),
  prompt: 'Hello, world!',
});

// Switch models instantly
const result2 = await generateText({
  model: gateway('anthropic/claude-3-5-sonnet'),
  prompt: 'Hello, world!',
});

// Or use without specifying provider
const result3 = await generateText({
  model: gateway('gpt-4o'),
  prompt: 'Hello, world!',
});`;

export default function GatewayPage() {
  const [isHoveringTry, setIsHoveringTry] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AI Gateway</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="#features">
                <Button variant="ghost" size="sm">
                  Features
                </Button>
              </Link>
              <Link href="#providers">
                <Button variant="ghost" size="sm">
                  Providers
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="ghost" size="sm">
                  Docs
                </Button>
              </Link>
              <Link href="/models">
                <Button variant="ghost" size="sm">
                  Models
                </Button>
              </Link>
              <Link href="/playground">
                <Button size="sm">
                  Playground
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm mb-8 bg-muted/50">
            <Globe className="w-4 h-4 mr-2 text-primary" />
            <span>Unified API for 50+ AI models</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            AI Gateway For <span className="text-primary">Developers</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
            One integration. Every model. Switch between OpenAI, Anthropic,
            Google, and more with a single line of code.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/playground">
              <Button
                size="lg"
                className="text-lg px-8 py-6"
                onMouseEnter={() => setIsHoveringTry(true)}
                onMouseLeave={() => setIsHoveringTry(false)}
              >
                Try the Playground
                <ArrowRight
                  className={`ml-2 h-5 w-5 transition-transform ${
                    isHoveringTry ? 'translate-x-1' : ''
                  }`}
                />
              </Button>
            </Link>
            <Link href="https://github.com/khulnasoft/ai-toolkit">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                View on GitHub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              One code, every provider
            </h2>
            <p className="text-lg text-muted-foreground">
              Drop in any model without changing your application code
            </p>
          </div>
          <div className="max-w-3xl mx-auto rounded-xl border bg-card overflow-hidden">
            <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
              <span className="text-sm text-muted-foreground">TypeScript</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
            </div>
            <pre className="p-6 text-sm overflow-x-auto">
              <code className="text-foreground">{codeExample}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to manage AI at scale
            </h2>
            <p className="text-lg text-muted-foreground">
              Production-grade features built for developers
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(feature => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border bg-card text-card-foreground hover:shadow-lg transition-shadow"
              >
                <feature.icon className="w-10 h-10 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Providers Section */}
      <section id="providers" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Support for every major provider
            </h2>
            <p className="text-lg text-muted-foreground">
              50+ models and counting
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {providers.map(provider => (
              <div
                key={provider.name}
                className="flex items-center justify-center p-4 rounded-lg border bg-background"
              >
                <span className="text-lg font-medium">{provider.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Built for enterprise security
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">API Key Management</h3>
                    <p className="text-muted-foreground text-sm">
                      Securely store and rotate API keys with environment-based
                      configuration.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Rate Limiting</h3>
                    <p className="text-muted-foreground text-sm">
                      Protect your API quotas with configurable rate limits per
                      model.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Request Logging</h3>
                    <p className="text-muted-foreground text-sm">
                      Full observability into every request and response for
                      audits.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold mb-4">Environment Configuration</h3>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{`# .env.local
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_API_KEY=AI...

# Use any model
gateway('gpt-4o')
gateway('claude-3-5-sonnet')
gateway('gemini-2-0-flash')`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start building with AI Gateway
          </h2>
          <p className="text-xl mb-12 opacity-90">
            Join thousands of developers using one API for every model
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/playground">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6"
              >
                Try the Playground
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="https://docs.studio.khulnasoft.com">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Read the Docs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-medium">AI Gateway</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built by{' '}
              <a
                href="https://vercel.com"
                className="underline hover:text-primary"
              >
                Vercel
              </a>
              . Open-source under Apache-2.0 license.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
