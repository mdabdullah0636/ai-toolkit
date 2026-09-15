'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Globe,
  ArrowRight,
  Code,
  FileText,
  Zap,
  Shield,
  Box,
  ChevronRight,
  Check,
} from 'lucide-react';

const sections = [
  {
    id: 'installation',
    title: 'Installation',
    description: 'Get started with AI Gateway in minutes',
    icon: Code,
  },
  {
    id: 'configuration',
    title: 'Configuration',
    description: 'Set up API keys and provider settings',
    icon: FileText,
  },
  {
    id: 'usage',
    title: 'Basic Usage',
    description: 'Generate text with any provider',
    icon: Zap,
  },
  {
    id: 'models',
    title: 'Models',
    description: 'Browse available models',
    icon: Box,
  },
  {
    id: 'security',
    title: 'Security',
    description: 'API keys, rate limiting, and more',
    icon: Shield,
  },
];

const installCode = `npm install ai @ai-toolkit/gateway`;

const configCode = `# .env.local
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_API_KEY=AI...`;

const usageCode = `import { generateText } from 'ai-toolkit';
import { gateway } from '@ai-toolkit/gateway';

// Use any model
const { text } = await generateText({
  model: gateway('gpt-4o'),
  prompt: 'Hello, world!',
});

// Switch providers easily
const { text: text2 } = await generateText({
  model: gateway('claude-3-5-sonnet'),
  prompt: 'Hello, world!',
});`;

const streamingCode = `import { streamText } from 'ai-toolkit';
import { gateway } from '@ai-toolkit/gateway';

const result = await streamText({
  model: gateway('gpt-4o'),
  prompt: 'Write a story',
});

for await (const chunk of result.textStream) {
  console.log(chunk);
}`;

const toolsCode = `import { generateText } from 'ai-toolkit';
import { gateway } from '@ai-toolkit/gateway';

const { text } = await generateText({
  model: gateway('gpt-4o'),
  prompt: 'What is the weather in Tokyo?',
  tools: {
    getWeather: {
      description: 'Get the weather for a location',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' },
        },
        required: ['location'],
      },
    },
  },
});`;

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('installation');

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
              <Link href="/gateway">
                <Button variant="ghost" size="sm">
                  Gateway
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

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Documentation</h2>
              <nav className="space-y-2">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    <span>{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="lg:col-span-3 space-y-12">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">AI Gateway Docs</h1>
              <p className="text-xl text-muted-foreground">
                Learn how to use AI Gateway to access 50+ models with a single
                API
              </p>
            </div>

            {/* Installation */}
            <section id="installation">
              <div className="flex items-center gap-3 mb-4">
                <Code className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold">Installation</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Install the AI Gateway package along with the core AI SDK:
              </p>
              <div className="rounded-lg border bg-card p-4">
                <pre className="text-sm overflow-x-auto">
                  <code>{installCode}</code>
                </pre>
              </div>
            </section>

            {/* Configuration */}
            <section id="configuration">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold">Configuration</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Configure your API keys in your environment variables. Create a{' '}
                <code className="bg-muted px-2 py-1 rounded">.env.local</code>{' '}
                file:
              </p>
              <div className="rounded-lg border bg-card p-4">
                <pre className="text-sm overflow-x-auto">
                  <code>{configCode}</code>
                </pre>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Security Note
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Never commit API keys to version control. Use environment
                      variables or a secrets manager.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Usage */}
            <section id="usage">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold">Basic Usage</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Use the{' '}
                <code className="bg-muted px-2 py-1 rounded">gateway</code>{' '}
                function to select any model:
              </p>
              <div className="rounded-lg border bg-card p-4">
                <pre className="text-sm overflow-x-auto">
                  <code>{usageCode}</code>
                </pre>
              </div>

              <h3 className="text-xl font-semibold mt-8 mb-4">Streaming</h3>
              <p className="text-muted-foreground mb-4">
                You can also stream responses for real-time output:
              </p>
              <div className="rounded-lg border bg-card p-4">
                <pre className="text-sm overflow-x-auto">
                  <code>{streamingCode}</code>
                </pre>
              </div>
            </section>

            {/* Models */}
            <section id="models">
              <div className="flex items-center gap-3 mb-4">
                <Box className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold">Models</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                AI Gateway supports 50+ models across 8 providers. Browse the
                complete model catalog:
              </p>
              <Link href="/models">
                <Button className="mt-2">
                  Browse Models
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </section>

            {/* Security */}
            <section id="security">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold">Security</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border">
                  <h3 className="font-semibold mb-2">API Key Management</h3>
                  <p className="text-muted-foreground text-sm">
                    API keys are loaded from environment variables at runtime.
                    The gateway never stores or logs your keys.
                  </p>
                </div>
                <div className="p-4 rounded-lg border">
                  <h3 className="font-semibold mb-2">Rate Limiting</h3>
                  <p className="text-muted-foreground text-sm">
                    Configure rate limits per model or provider to prevent quota
                    exhaustion and manage costs.
                  </p>
                </div>
                <div className="p-4 rounded-lg border">
                  <h3 className="font-semibold mb-2">Request Logging</h3>
                  <p className="text-muted-foreground text-sm">
                    Enable detailed logging for debugging and audit trails while
                    keeping PII protected.
                  </p>
                </div>
              </div>
            </section>

            {/* Next Steps */}
            <section className="py-12 border-t">
              <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/playground">
                  <div className="p-4 rounded-lg border hover:shadow-lg transition-shadow cursor-pointer">
                    <h3 className="font-semibold mb-2">Try the Playground</h3>
                    <p className="text-sm text-muted-foreground">
                      Experiment with different models in an interactive
                      interface
                    </p>
                  </div>
                </Link>
                <Link href="https://docs.studio.khulnasoft.com">
                  <div className="p-4 rounded-lg border hover:shadow-lg transition-shadow cursor-pointer">
                    <h3 className="font-semibold mb-2">Full Documentation</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete reference for all AI Gateway features
                    </p>
                  </div>
                </Link>
              </div>
            </section>
          </main>
        </div>
      </div>

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
