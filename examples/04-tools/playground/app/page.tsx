'use client';

import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Boxes,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Github,
  Grid2X2,
  Layers3,
  Library,
  Menu,
  Play,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Terminal,
  Wrench,
  X,
} from 'lucide-react';

type Section =
  | 'Playground'
  | 'Recipes'
  | 'Tools Registry'
  | 'Templates'
  | 'Showcase'
  | 'Providers';

const sections: { label: Section; icon: typeof Sparkles; count?: string }[] = [
  { label: 'Playground', icon: Sparkles },
  { label: 'Recipes', icon: Library, count: '24' },
  { label: 'Tools Registry', icon: Wrench, count: '48' },
  { label: 'Templates', icon: Boxes, count: '18' },
  { label: 'Showcase', icon: Grid2X2, count: '96' },
  { label: 'Providers', icon: Layers3, count: '32' },
];

const models = [
  {
    name: 'Claude 3.7 Sonnet',
    id: 'anthropic/claude-3-7-sonnet',
    provider: 'Anthropic',
    latency: '0.8s',
    color: 'bg-orange-400',
  },
  {
    name: 'GPT-4.1',
    id: 'openai/gpt-4.1',
    provider: 'OpenAI',
    latency: '0.6s',
    color: 'bg-emerald-400',
  },
  {
    name: 'Gemini 2.5 Pro',
    id: 'google/gemini-2.5-pro',
    provider: 'Google',
    latency: '0.7s',
    color: 'bg-blue-400',
  },
  {
    name: 'Llama 4 Maverick',
    id: 'meta/llama-4-maverick',
    provider: 'Meta',
    latency: '0.5s',
    color: 'bg-cyan-400',
  },
];

const catalog: Record<
  Exclude<Section, 'Playground'>,
  {
    eyebrow: string;
    title: string;
    description: string;
    cards: { title: string; description: string; tag: string; meta: string }[];
  }
> = {
  Recipes: {
    eyebrow: 'OPEN-SOURCE RECIPES',
    title: 'Build specific AI features faster.',
    description:
      'Production-ready patterns for common AI Toolkit use cases, from structured extraction to durable agents.',
    cards: [
      {
        title: 'RAG with reranking',
        description:
          'Search, rerank, and stream grounded answers with citations.',
        tag: 'RAG',
        meta: 'Next.js · 12 min',
      },
      {
        title: 'Structured data extraction',
        description: 'Turn messy documents into typed, validated objects.',
        tag: 'GENERATE OBJECT',
        meta: 'TypeScript · 8 min',
      },
      {
        title: 'Human in the loop',
        description: 'Pause tool calls and resume when a teammate approves.',
        tag: 'AGENTS',
        meta: 'Workflow · 14 min',
      },
    ],
  },
  'Tools Registry': {
    eyebrow: 'COMMUNITY REGISTRY',
    title: 'Give your agent superpowers.',
    description:
      'Drop-in tools for web search, extraction, code execution, and more. Install a tool, define a schema, ship.',
    cards: [
      {
        title: 'Web search',
        description: 'Search the web and return sourced, relevant results.',
        tag: 'SEARCH',
        meta: 'npm install · 4.2k',
      },
      {
        title: 'Exa research',
        description: 'Find and synthesize high-quality research in one call.',
        tag: 'RESEARCH',
        meta: 'npm install · 2.8k',
      },
      {
        title: 'Browser automation',
        description: 'Let agents navigate pages and complete workflows.',
        tag: 'BROWSER',
        meta: 'npm install · 1.9k',
      },
    ],
  },
  Templates: {
    eyebrow: 'START BUILDING',
    title: 'The fastest path from idea to AI app.',
    description:
      'Official templates and framework integrations with the right primitives already wired up.',
    cards: [
      {
        title: 'Next.js AI Chatbot',
        description: 'A full-featured chat app with persistence and auth.',
        tag: 'NEXT.JS',
        meta: 'TypeScript · 8.4k',
      },
      {
        title: 'AI SDK Starter',
        description: 'Minimal starter for text, objects, tools, and streaming.',
        tag: 'STARTER',
        meta: 'TypeScript · 3.1k',
      },
      {
        title: 'Generative UI',
        description: 'Render rich React components from model tool calls.',
        tag: 'REACT',
        meta: 'Next.js · 2.2k',
      },
    ],
  },
  Showcase: {
    eyebrow: 'BUILT WITH AI TOOLKIT',
    title: 'See what people are shipping.',
    description:
      'Popular products and projects from the community, all built on the same flexible primitives.',
    cards: [
      {
        title: 'Dub',
        description: 'The modern link management platform with AI workflows.',
        tag: 'PLATFORM',
        meta: 'Featured',
      },
      {
        title: 'Cal.com Agent',
        description: 'Schedule meetings through a conversational interface.',
        tag: 'AGENT',
        meta: 'Featured',
      },
      {
        title: 'Replit Agent',
        description:
          'Turn ideas into software with an autonomous coding agent.',
        tag: 'CODING',
        meta: 'Featured',
      },
    ],
  },
  Providers: {
    eyebrow: 'MODEL PROVIDERS',
    title: 'One toolkit. Every model.',
    description:
      'Use the provider that fits your application, or route through AI Gateway for one API key and automatic fallbacks.',
    cards: [
      {
        title: 'AI Gateway',
        description: 'Hundreds of models from one unified API with no markup.',
        tag: 'VERCEL',
        meta: 'Gateway · 100+ models',
      },
      {
        title: 'Anthropic',
        description: 'Claude models for reasoning, writing, and coding.',
        tag: 'PROVIDER',
        meta: 'Direct provider',
      },
      {
        title: 'OpenAI',
        description: 'GPT models with text, vision, and structured outputs.',
        tag: 'PROVIDER',
        meta: 'Direct provider',
      },
    ],
  },
};

function SelectBox({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full appearance-none rounded-md border border-border bg-background px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 size-4 text-muted-foreground" />
    </div>
  );
}

function ModelPanel({
  index,
  modelId,
  setModelId,
  response,
  isRunning,
}: {
  index: number;
  modelId: string;
  setModelId: (value: string) => void;
  response: string;
  isRunning: boolean;
}) {
  const model = models.find(item => item.id === modelId) ?? models[0];
  return (
    <div className="flex min-h-[355px] flex-col border-b border-border lg:border-b-0 lg:border-r last:border-0">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">
            MODEL {index + 1}
          </span>
          <span className={`size-2 rounded-full ${model.color}`} />
        </div>
        <button className="text-muted-foreground hover:text-foreground">
          <Settings2 className="size-4" />
        </button>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <SelectBox value={model.id} onChange={setModelId}>
          {models.map(item => (
            <option value={item.id} key={item.id}>
              {item.name}
            </option>
          ))}
        </SelectBox>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{model.provider}</span>
          <span>{model.latency} avg latency</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-3 p-4">
        <div className="rounded-md border border-border bg-muted/30 p-3 text-sm leading-6 text-muted-foreground">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-primary">
            {isRunning ? 'streaming' : 'response'}
          </span>
          {isRunning ? (
            <span className="inline-flex items-center gap-1">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              <span className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
              <span className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
            </span>
          ) : (
            response || 'Run a prompt to compare model responses.'
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
          <span>
            Temperature <b className="font-mono text-foreground">0.7</b>
          </span>
          <span>
            Tokens <b className="font-mono text-foreground">1,024</b>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [active, setActive] = useState<Section>('Playground');
  const [mobileNav, setMobileNav] = useState(false);
  const [modelA, setModelA] = useState(models[0].id);
  const [modelB, setModelB] = useState(models[1].id);
  const [prompt, setPrompt] = useState(
    'Explain how streaming responses work in the AI SDK.',
  );
  const [responses, setResponses] = useState(['', '']);
  const [running, setRunning] = useState(false);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredCards = useMemo(
    () =>
      active === 'Playground'
        ? []
        : catalog[active].cards.filter(card =>
            `${card.title} ${card.description} ${card.tag}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          ),
    [active, query],
  );
  const runPrompt = () => {
    if (!prompt.trim()) return;
    setRunning(true);
    setResponses(['', '']);
    window.setTimeout(() => {
      setResponses([
        'Streaming lets your UI render output as it arrives instead of waiting for a complete response. The Gateway keeps the interface consistent across providers.',
        'The AI SDK exposes a unified stream so you can send model output directly to the client. This makes responses feel instant while preserving provider flexibility.',
      ]);
      setRunning(false);
    }, 850);
  };
  const copyCode = async () => {
    await navigator.clipboard?.writeText(
      `import { streamText } from 'ai-toolkit'\n\nconst result = streamText({\n  model: '${modelA}',\n  prompt,\n})`,
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNav(!mobileNav)}
              className="rounded-md p-2 hover:bg-muted lg:hidden"
            >
              {mobileNav ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
            </button>
            <a
              href="#"
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
              AI TOOLKIT
            </a>
            <span className="hidden border-l border-border pl-3 font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground sm:inline">
              Playground
            </span>
          </div>
          <div className="hidden items-center gap-5 text-xs text-muted-foreground md:flex">
            <a href="#" className="hover:text-foreground">
              Docs
            </a>
            <a href="#" className="hover:text-foreground">
              GitHub
            </a>
            <a href="#" className="hover:text-foreground">
              Discord
            </a>
            <button className="rounded-md border border-border px-3 py-1.5 text-foreground hover:bg-muted">
              Sign in
            </button>
          </div>
          <button className="rounded-md p-2 text-muted-foreground hover:bg-muted md:hidden">
            <Github className="size-4" />
          </button>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1600px]">
        <aside
          className={`${mobileNav ? 'block' : 'hidden'} fixed inset-x-0 top-14 z-10 min-h-[calc(100vh-3.5rem)] border-r border-border bg-background p-4 lg:static lg:block lg:min-h-[calc(100vh-3.5rem)] lg:w-60 lg:shrink-0`}
        >
          <div className="mb-5 flex items-center justify-between px-2">
            <span className="font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">
              Explore
            </span>
            <Search className="size-3.5 text-muted-foreground" />
          </div>
          <nav className="flex flex-col gap-1">
            {sections.map(({ label, icon: Icon, count }) => (
              <button
                key={label}
                onClick={() => {
                  setActive(label);
                  setMobileNav(false);
                }}
                className={`flex items-center justify-between rounded-md px-3 py-2.5 text-left text-sm ${active === label ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    className={
                      active === label ? 'size-4 text-primary' : 'size-4'
                    }
                  />
                  {label}
                </span>
                {count && (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="mt-8 border-t border-border pt-6">
            <p className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">
              Your workspace
            </p>
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
              <Plus className="size-4" />
              New session
            </button>
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
              <Terminal className="size-4" />
              Code snippets
            </button>
          </div>
          <div className="mt-8 rounded-md border border-border bg-muted/30 p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
              AI GATEWAY
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Hundreds of models. One API key. No markup.
            </p>
            <button className="mt-3 flex items-center gap-1 text-xs font-medium text-foreground hover:text-primary">
              Learn more <ArrowUpRight className="size-3" />
            </button>
          </div>
        </aside>
        <section className="min-w-0 flex-1 px-4 py-7 lg:px-8 lg:py-10">
          {active === 'Playground' ? (
            <>
              <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">
                    COMPARE MODELS
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
                    Playground
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Experiment with models, prompts, and settings before you
                    write a line of production code.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs hover:bg-muted">
                    <BookOpen className="size-3.5" /> Docs
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90">
                    <Plus className="size-3.5" /> Add model
                  </button>
                </div>
              </div>
              <div className="mb-5 flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                <span className="flex size-5 items-center justify-center rounded bg-primary/15 text-primary">
                  <ZapIcon />
                </span>
                <span>
                  <b className="text-foreground">AI Gateway</b> gives you access
                  to 100+ models from one API key.
                </span>
                <a
                  href="#"
                  className="ml-auto flex items-center gap-1 font-medium text-foreground hover:text-primary"
                >
                  Explore providers <ArrowUpRight className="size-3" />
                </a>
              </div>
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Untitled comparison
                    </span>
                  </div>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {copied ? (
                      <Check className="size-3.5 text-primary" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    {copied ? 'Copied' : 'Copy code'}
                  </button>
                </div>
                <div className="grid lg:grid-cols-2">
                  <ModelPanel
                    index={0}
                    modelId={modelA}
                    setModelId={setModelA}
                    response={responses[0]}
                    isRunning={running}
                  />
                  <ModelPanel
                    index={1}
                    modelId={modelB}
                    setModelId={setModelB}
                    response={responses[1]}
                    isRunning={running}
                  />
                </div>
                <div className="border-t border-border bg-muted/20 p-4">
                  <textarea
                    value={prompt}
                    onChange={event => setPrompt(event.target.value)}
                    rows={3}
                    className="w-full resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-muted-foreground"
                    placeholder="Ask both models anything..."
                  />
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <button className="rounded-md p-1.5 hover:bg-muted">
                        <Plus className="size-4" />
                      </button>
                      <span className="hidden sm:inline">
                        Add context or tools
                      </span>
                      <span className="font-mono text-[10px]">⌘ ↵ to run</span>
                    </div>
                    <button
                      onClick={runPrompt}
                      disabled={running}
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-60"
                    >
                      {running ? 'Running' : 'Run prompt'}
                      <Play className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-md border border-border p-4">
                  <Code2 className="size-4 text-primary" />
                  <p className="mt-4 text-sm font-medium">
                    Write less glue code
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    One API for every provider, with typed primitives for your
                    app.
                  </p>
                </div>
                <div className="rounded-md border border-border p-4">
                  <Wrench className="size-4 text-primary" />
                  <p className="mt-4 text-sm font-medium">
                    Tools that just work
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Give your agents capabilities with a few lines of code.
                  </p>
                </div>
                <div className="rounded-md border border-border p-4">
                  <Layers3 className="size-4 text-primary" />
                  <p className="mt-4 text-sm font-medium">
                    Ship with confidence
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Start from recipes and templates built by the community.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">
                    {catalog[active].eyebrow}
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
                    {catalog[active].title}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {catalog[active].description}
                  </p>
                </div>
                <div className="relative w-full lg:w-64">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder={`Search ${active.toLowerCase()}...`}
                    className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredCards.map(card => (
                  <article
                    key={card.title}
                    className="group flex min-h-52 flex-col rounded-lg border border-border bg-card p-5 hover:border-primary/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] tracking-widest text-primary">
                        {card.tag}
                      </span>
                      <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                    <h2 className="mt-8 text-lg font-medium tracking-tight">
                      {card.title}
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                      {card.description}
                    </p>
                    <div className="mt-5 border-t border-border pt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {card.meta}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function ZapIcon() {
  return <span className="text-[10px]">↯</span>;
}
