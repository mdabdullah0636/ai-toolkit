'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Bot,
  User,
  Code,
  Zap,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  FileText,
  ChevronRight,
  MousePointer,
} from 'lucide-react';

const components = [
  {
    id: 'chat-message',
    name: 'ChatMessage',
    description:
      'Display AI and user messages with avatars, timestamps, and status',
    icon: MessageSquare,
  },
  {
    id: 'code-block',
    name: 'CodeBlock',
    description:
      'Syntax-highlighted code with copy button and language selection',
    icon: Code,
  },
  {
    id: 'reasoning',
    name: 'Reasoning',
    description: 'Show step-by-step reasoning with collapsible think process',
    icon: Zap,
  },
  {
    id: 'tool-call',
    name: 'ToolCall',
    description: 'Display tool invocations with arguments and results',
    icon: FileText,
  },
  {
    id: 'typing-indicator',
    name: 'TypingIndicator',
    description: 'Animated dots to show AI is thinking',
    icon: RefreshCw,
  },
  {
    id: 'avatar',
    name: 'Avatar',
    description: 'AI and user avatars with status indicators',
    icon: User,
  },
];

const features = [
  {
    title: 'Accessible',
    description:
      'WCAG compliant, keyboard navigation, and screen reader support',
  },
  {
    title: 'Customizable',
    description: 'Theme, styling, and behavior via props and CSS variables',
  },
  {
    title: 'TypeScript',
    description: 'Full type safety with comprehensive type definitions',
  },
  {
    title: 'SSR Compatible',
    description: 'Works with Next.js, React Server Components, and more',
  },
];

const chatMessageExample = `import { ChatMessage } from '@ai-toolkit/react';

function Chat() {
  return (
    <ChatMessage
      role="assistant"
      content="Hello! How can I help you today?"
      timestamp={new Date()}
    />
  );
}`;

const codeBlockExample = `import { CodeBlock } from '@ai-toolkit/react';

function CodeExample() {
  return (
    <CodeBlock
      code={\`function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet('World'));\`}
      language="typescript"
    />
  );
}`;

const reasoningExample = `import { Reasoning } from '@ai-toolkit/react';

function ReasoningExample() {
  return (
    <Reasoning
      steps={[
        { status: 'complete', content: 'Analyzing the question...' },
        { status: 'complete', content: 'Searching knowledge base...' },
        { status: 'streaming', content: 'Formulating response...' },
      ]}
    />
  );
}`;

export default function ElementsPage() {
  const [copiedChat, setCopiedChat] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedReasoning, setCopiedReasoning] = useState(false);

  const copyToClipboard = async (
    text: string,
    setCopied: (v: boolean) => void,
  ) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AI Toolkit</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/elements">
                <Button variant="ghost" size="sm">
                  Elements
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

      {/* Hero */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm mb-8 bg-muted/50">
            <Sparkles className="w-4 h-4 mr-2 text-primary" />
            <span>React Components</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            AI Elements For <span className="text-primary">React</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Pre-built, customizable React components specifically designed for
            AI applications. Build chat interfaces in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#components">
              <Button size="lg" className="text-lg px-8 py-6">
                Browse Components
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="https://docs.studio.khulnasoft.com/docs/ai-toolkit-ui">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Read the Docs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(feature => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border bg-card text-card-foreground"
              >
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {/* ChatMessage */}
            <div>
              <h3 className="text-2xl font-bold mb-4">ChatMessage</h3>
              <p className="text-muted-foreground mb-6">
                The core component for displaying messages in a chat interface.
              </p>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-xl border bg-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">React</span>
                    <button
                      onClick={() =>
                        copyToClipboard(chatMessageExample, setCopiedChat)
                      }
                      className="p-2 rounded hover:bg-accent"
                    >
                      {copiedChat ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <pre className="text-sm overflow-x-auto">
                    <code>{chatMessageExample}</code>
                  </pre>
                </div>
                <div className="rounded-xl border p-6 flex items-center justify-center">
                  <div className="max-w-xs space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-sm">
                          Hello! How can I help you today?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CodeBlock */}
            <div>
              <h3 className="text-2xl font-bold mb-4">CodeBlock</h3>
              <p className="text-muted-foreground mb-6">
                Syntax-highlighted code with copy functionality.
              </p>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-xl border bg-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">React</span>
                    <button
                      onClick={() =>
                        copyToClipboard(codeBlockExample, setCopiedCode)
                      }
                      className="p-2 rounded hover:bg-accent"
                    >
                      {copiedCode ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <pre className="text-sm overflow-x-auto">
                    <code>{codeBlockExample}</code>
                  </pre>
                </div>
                <div className="rounded-xl border p-4 flex items-center justify-center">
                  <div className="max-w-xs">
                    <pre className="text-sm bg-muted p-3 rounded">
                      <code>{`function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet('World'));`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Reasoning */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Reasoning</h3>
              <p className="text-muted-foreground mb-6">
                Show the AI&apos;s thinking process with step-by-step display.
              </p>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-xl border bg-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">React</span>
                    <button
                      onClick={() =>
                        copyToClipboard(reasoningExample, setCopiedReasoning)
                      }
                      className="p-2 rounded hover:bg-accent"
                    >
                      {copiedReasoning ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <pre className="text-sm overflow-x-auto">
                    <code>{reasoningExample}</code>
                  </pre>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Analyzing the question...</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Searching knowledge base...</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Formulating response...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Components Grid */}
      <section id="components" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              All Components
            </h2>
            <p className="text-lg text-muted-foreground">
              Ready-to-use components for AI applications
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {components.map(component => (
              <div
                key={component.id}
                className="p-6 rounded-xl border bg-card text-card-foreground hover:shadow-lg transition-shadow cursor-pointer"
              >
                <component.icon className="w-8 h-8 mb-4 text-primary" />
                <h3 className="font-semibold text-lg mb-2">{component.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {component.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Get Started</h2>
          <p className="text-muted-foreground mb-8">
            Install AI Elements and start building your AI chat interface
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/playground">
              <Button size="lg">
                Try in Playground
                <ArrowRight className="ml-2 h-5 w-5" />
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
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-medium">AI Toolkit</span>
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
