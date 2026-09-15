'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Star,
  Zap,
  MessageSquare,
  Image,
  AudioWaveform,
  FileText,
  ArrowUpRight,
  Globe,
} from 'lucide-react';

const modelProviders = [
  { id: 'openai', name: 'OpenAI', color: '#10a37f' },
  { id: 'anthropic', name: 'Anthropic', color: '#d97757' },
  { id: 'google', name: 'Google', color: '#4285f4' },
  { id: 'azure', name: 'Azure', color: '#0078d4' },
  { id: 'mistral', name: 'Mistral', color: '#ff7000' },
  { id: 'cohere', name: 'Cohere', color: '#5959ab' },
  { id: 'deepseek', name: 'DeepSeek', color: '#202123' },
  { id: 'amazon', name: 'Amazon', color: '#ff9900' },
];

const modelCategories = [
  { id: 'chat', name: 'Chat', icon: MessageSquare, count: 45 },
  { id: 'reasoning', name: 'Reasoning', icon: Zap, count: 12 },
  { id: 'code', name: 'Code', icon: FileText, count: 18 },
  { id: 'vision', name: 'Vision', icon: Image, count: 22 },
  { id: 'audio', name: 'Audio', icon: AudioWaveform, count: 8 },
  { id: 'embedding', name: 'Embedding', icon: Star, count: 15 },
];

const models = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    category: 'chat',
    context: '128K',
    latest: true,
    featured: true,
    description: 'Most capable GPT-4 model for complex tasks',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    category: 'chat',
    context: '128K',
    latest: true,
    description: 'Fast, inexpensive model for simple tasks',
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    category: 'chat',
    context: '128K',
    description: 'Fast and capable. Knowledge cutoff 2023-09.',
  },
  {
    id: 'o1',
    name: 'o1',
    provider: 'openai',
    category: 'reasoning',
    context: '200K',
    latest: true,
    featured: true,
    description: 'Reasoning model for complex problems',
  },
  {
    id: 'o1-mini',
    name: 'o1-mini',
    provider: 'openai',
    category: 'reasoning',
    context: '200K',
    latest: true,
    description: 'Fast reasoning model for coding tasks',
  },
  {
    id: 'o3',
    name: 'o3',
    provider: 'openai',
    category: 'reasoning',
    context: '200K',
    latest: true,
    description: 'Next-gen reasoning model',
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    provider: 'openai',
    category: 'reasoning',
    context: '200K',
    latest: true,
    description: 'Fast next-gen reasoning model',
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'anthropic',
    category: 'chat',
    context: '200K',
    latest: true,
    featured: true,
    description: 'Balanced for complex reasoning and dialog',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    category: 'chat',
    context: '200K',
    latest: true,
    description: 'Fast and capable with vision',
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    category: 'chat',
    context: '200K',
    latest: true,
    description: 'Fast, lightweight model',
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    category: 'chat',
    context: '200K',
    description: 'Most capable model for complex tasks',
  },
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    category: 'chat',
    context: '200K',
    latest: true,
    description: 'Latest Sonnet with enhanced reasoning',
  },
  {
    id: 'gemini-2-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    category: 'chat',
    context: '1M',
    latest: true,
    featured: true,
    description: 'Fast and capable with 1M context',
  },
  {
    id: 'gemini-2-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    provider: 'google',
    category: 'chat',
    context: '1M',
    latest: true,
    description: 'Cost-efficient model with vision',
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    category: 'chat',
    context: '2M',
    latest: true,
    description: 'Long context with 2M tokens',
  },
  {
    id: 'gemini-1-5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    category: 'chat',
    context: '1M',
    latest: true,
    description: 'Fast with 1M context',
  },
  {
    id: 'gemini-2-5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    category: 'reasoning',
    context: '1M',
    latest: true,
    description: 'Advanced reasoning with vision',
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'mistral',
    category: 'chat',
    context: '128K',
    latest: true,
    description: 'Capable model for complex tasks',
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small',
    provider: 'mistral',
    category: 'chat',
    context: '128K',
    latest: true,
    description: 'Fast and efficient',
  },
  {
    id: 'pixtral-large',
    name: 'Pixtral Large',
    provider: 'mistral',
    category: 'vision',
    context: '128K',
    latest: true,
    description: 'Vision model with strong reasoning',
  },
  {
    id: 'command-r',
    name: 'Command R',
    provider: 'cohere',
    category: 'chat',
    context: '128K',
    latest: true,
    description: 'RAG-optimized for enterprise',
  },
  {
    id: 'command-r-plus',
    name: 'Command R+',
    provider: 'cohere',
    category: 'chat',
    context: '128K',
    latest: true,
    description: 'Most capable for complex tasks',
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    category: 'chat',
    context: '64K',
    latest: true,
    description: 'Open-source conversational model',
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'deepseek',
    category: 'code',
    context: '128K',
    latest: true,
    description: 'Specialized for code generation',
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    provider: 'deepseek',
    category: 'reasoning',
    context: '64K',
    latest: true,
    description: 'Advanced reasoning model',
  },
  {
    id: 'llama-3-1-405b',
    name: 'Llama 3.1 405B',
    provider: 'amazon',
    category: 'chat',
    context: '128K',
    latest: true,
    description: 'Open model with large context',
  },
  {
    id: 'llama-3-1-70b',
    name: 'Llama 3.1 70B',
    provider: 'amazon',
    category: 'chat',
    context: '128K',
    latest: true,
    description: 'Balanced open model',
  },
  {
    id: 'llama-3-1-8b',
    name: 'Llama 3.1 8B',
    provider: 'amazon',
    category: 'chat',
    context: '128K',
    latest: true,
    description: 'Fast, lightweight open model',
  },
  {
    id: 'nova-pro',
    name: 'Nova Pro',
    provider: 'amazon',
    category: 'chat',
    context: '300K',
    latest: true,
    description: 'Large context model',
  },
  {
    id: 'azure-gpt-4o',
    name: 'GPT-4o',
    provider: 'azure',
    category: 'chat',
    context: '128K',
    description: 'Azure OpenAI deployment',
  },
  {
    id: 'azure-gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'azure',
    category: 'chat',
    context: '128K',
    description: 'Azure OpenAI fast deployment',
  },
];

const capabilityColors: Record<string, string> = {
  chat: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  reasoning:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  code: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  vision:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  audio: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  embedding:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

export default function ModelsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showProviders, setShowProviders] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const filteredModels = models.filter(model => {
    const matchesSearch =
      searchQuery === '' ||
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider =
      selectedProvider === null || model.provider === selectedProvider;
    const matchesCategory =
      selectedCategory === null || model.category === selectedCategory;
    return matchesSearch && matchesProvider && matchesCategory;
  });

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
              <Link href="/models">
                <Button variant="ghost" size="sm">
                  Models
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="ghost" size="sm">
                  Docs
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
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              AI Gateway Models
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse the complete catalog of models available through AI Gateway
            </p>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Provider Filter */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => {
                  setShowProviders(!showProviders);
                  setShowCategories(false);
                }}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Provider
                <ChevronDown className="w-4 h-4" />
              </Button>
              {showProviders && (
                <div className="absolute top-full left-0 mt-2 w-48 rounded-lg border bg-background shadow-lg z-10">
                  <button
                    onClick={() => setSelectedProvider(null)}
                    className={`w-full px-4 py-2 text-left hover:bg-accent ${
                      selectedProvider === null ? 'bg-accent' : ''
                    }`}
                  >
                    All Providers
                  </button>
                  {modelProviders.map(provider => (
                    <button
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider.id)}
                      className={`w-full px-4 py-2 text-left hover:bg-accent ${
                        selectedProvider === provider.id ? 'bg-accent' : ''
                      }`}
                    >
                      {provider.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCategories(!showCategories);
                  setShowProviders(false);
                }}
                className="flex items-center gap-2"
              >
                Category
                <ChevronDown className="w-4 h-4" />
              </Button>
              {showCategories && (
                <div className="absolute top-full left-0 mt-2 w-48 rounded-lg border bg-background shadow-lg z-10">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full px-4 py-2 text-left hover:bg-accent flex items-center justify-between ${
                      selectedCategory === null ? 'bg-accent' : ''
                    }`}
                  >
                    All Categories
                    <span className="text-muted-foreground">
                      {models.length}
                    </span>
                  </button>
                  {modelCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full px-4 py-2 text-left hover:bg-accent flex items-center justify-between ${
                        selectedCategory === category.id ? 'bg-accent' : ''
                      }`}
                    >
                      {category.name}
                      <span className="text-muted-foreground">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Active Filters */}
            {selectedProvider && (
              <Button
                variant="secondary"
                onClick={() => setSelectedProvider(null)}
                className="flex items-center gap-1"
              >
                {modelProviders.find(p => p.id === selectedProvider)?.name}
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {selectedCategory && (
              <Button
                variant="secondary"
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-1"
              >
                {modelCategories.find(c => c.id === selectedCategory)?.name}
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}

            <span className="ml-auto text-muted-foreground">
              {filteredModels.length} models
            </span>
          </div>
        </div>
      </section>

      {/* Models Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map(model => {
              const provider = modelProviders.find(
                p => p.id === model.provider,
              );
              const CategoryIcon =
                modelCategories.find(c => c.id === model.category)?.icon ||
                MessageSquare;
              return (
                <div
                  key={model.id}
                  className="p-5 rounded-xl border bg-card hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{model.name}</h3>
                      <p className="text-sm" style={{ color: provider?.color }}>
                        {provider?.name}
                      </p>
                    </div>
                    {model.featured && (
                      <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {model.description}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        capabilityColors[model.category] ||
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {model.category}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-muted">
                      {model.context} context
                    </span>
                    {model.latest && (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Latest
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredModels.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No models found matching your search.
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedProvider(null);
                  setSelectedCategory(null);
                }}
                className="mt-2"
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">
            Try any model in the playground with just a few clicks
          </p>
          <Link href="/playground">
            <Button size="lg">
              Try in Playground
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
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
