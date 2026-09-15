'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Play, Copy, MessageSquare } from 'lucide-react';

interface ExampleTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  prompt: string;
  icon: React.ReactNode;
}

const exampleTemplates: ExampleTemplate[] = [
  {
    id: 'story-writing',
    title: 'Creative Story Writing',
    description: 'Generate engaging stories with AI assistance',
    category: 'Creative',
    prompt:
      'Write a short story about a time-traveling detective who solves historical mysteries.',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    id: 'code-review',
    title: 'Code Review Assistant',
    description: 'Get AI-powered code reviews and suggestions',
    category: 'Development',
    prompt:
      'Review this TypeScript function for potential improvements and best practices:\n\nfunction calculateTotal(items: Item[]) {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}',
    icon: <Play className="h-5 w-5" />,
  },
  {
    id: 'email-writing',
    title: 'Professional Email',
    description: 'Draft professional emails with proper tone',
    category: 'Business',
    prompt:
      'Write a professional email to a client about a project delay, explaining the situation and proposing a new timeline.',
    icon: <Copy className="h-5 w-5" />,
  },
  {
    id: 'data-analysis',
    title: 'Data Analysis Helper',
    description: 'Analyze and interpret data patterns',
    category: 'Analytics',
    prompt:
      'Analyze this sales data and provide insights: Q1: $45,000, Q2: $52,000, Q3: $48,000, Q4: $61,000',
    icon: <Play className="h-5 w-5" />,
  },
  {
    id: 'learning-explanation',
    title: 'Complex Topic Explainer',
    description: 'Break down complex topics into simple explanations',
    category: 'Education',
    prompt:
      'Explain quantum computing in simple terms that a high school student can understand.',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    id: 'api-design',
    title: 'API Design Assistant',
    description: 'Design RESTful APIs and endpoints',
    category: 'Development',
    prompt:
      'Design a RESTful API for a task management application with users, projects, and tasks.',
    icon: <Play className="h-5 w-5" />,
  },
];

interface ExampleTemplatesProps {
  onSelectExample: (prompt: string) => void;
}

export function ExampleTemplates({ onSelectExample }: ExampleTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    ...Array.from(new Set(exampleTemplates.map(t => t.category))),
  ];

  const filteredTemplates =
    selectedCategory === 'All'
      ? exampleTemplates
      : exampleTemplates.filter(t => t.category === selectedCategory);

  const handleUseExample = (template: ExampleTemplate) => {
    onSelectExample(template.prompt);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Example Templates</h3>

        <div className="flex space-x-2 mb-6">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map(template => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-md text-primary">
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm">{template.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {template.category}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">
                  {template.description}
                </p>
                <div className="bg-muted p-2 rounded-md mb-3">
                  <p className="text-xs font-mono truncate">
                    {template.prompt}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleUseExample(template)}
                >
                  <Play className="h-3 w-3 mr-2" />
                  Use This Example
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
