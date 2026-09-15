'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Copy, Download, X } from 'lucide-react';

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  onGenerate?: (prompt: string) => void;
  onClose?: () => void;
  isGenerating?: boolean;
}

export function CodeEditor({
  initialCode = '',
  language = 'typescript',
  onGenerate,
  onClose,
  isGenerating = false,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  useEffect(() => {
    if (!onClose) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-code.${language === 'typescript' ? 'ts' : 'js'}`;
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const handleGenerate = () => {
    if (prompt.trim() && onGenerate) {
      onGenerate(prompt);
      setPrompt('');
    }
  };

  return (
    <div className="border rounded-lg">
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Code Editor</h3>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              aria-label="Copy code"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              aria-label="Download code"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close code editor"
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Generate Code Prompt</label>
            <div className="flex space-x-2 mt-1">
              <input
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Describe the code you want to generate..."
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                aria-label="Generate code"
              >
                {isGenerating ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="relative">
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="// Your generated code will appear here..."
            className="w-full h-96 p-4 font-mono text-sm bg-muted border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            spellCheck={false}
          />
          <div className="absolute top-2 right-2 text-xs text-muted-foreground">
            {language}
          </div>
        </div>
      </div>
    </div>
  );
}
