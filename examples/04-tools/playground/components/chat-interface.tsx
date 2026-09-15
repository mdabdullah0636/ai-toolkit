'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Loader2, Send, User } from 'lucide-react';

export function ChatInterface({
  modelId,
}: {
  providerId: string;
  modelId: string;
}) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput('');
    setMessages(items => [...items, { role: 'user', text }]);
    setLoading(true);
    window.setTimeout(() => {
      setMessages(items => [
        ...items,
        {
          role: 'assistant',
          text: `Preview response from ${modelId}: ${text}`,
        },
      ]);
      setLoading(false);
    }, 500);
  };
  return (
    <div className="flex h-[600px] flex-col rounded-lg border">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex h-full min-h-96 items-center justify-center text-center text-muted-foreground">
              <div>
                <Bot className="mx-auto mb-4 size-10 opacity-50" />
                <p>Start a conversation with {modelId}</p>
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role === 'assistant' && (
                <Bot className="mt-2 size-4 text-primary" />
              )}
              {message.role === 'user' && (
                <div className="max-w-[80%] rounded-lg bg-primary p-3 text-sm text-primary-foreground">
                  <User className="mb-1 size-3" />
                  {message.text}
                </div>
              )}
              {message.role === 'assistant' && (
                <div className="max-w-[80%] rounded-lg bg-muted p-3 text-sm">
                  {message.text}
                </div>
              )}
            </div>
          ))}
          {loading && <Loader2 className="size-4 animate-spin text-primary" />}
        </div>
      </div>
      <form onSubmit={submit} className="flex gap-2 border-t p-4">
        <input
          value={input}
          onChange={event => setInput(event.target.value)}
          placeholder="Type your message..."
          className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
