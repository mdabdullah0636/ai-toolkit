import { Fragment } from 'react';

function renderInline(text: string, key: number): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return (
    <Fragment key={key}>
      {parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={index} className="rounded bg-muted px-1 py-0.5 text-sm">
              {part.slice(1, -1)}
            </code>
          );
        }
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (linkMatch) {
          return (
            <a
              key={index}
              href={linkMatch[2]}
              target={linkMatch[2].startsWith('http') ? '_blank' : undefined}
              rel={linkMatch[2].startsWith('http') ? 'noreferrer' : undefined}
              className="text-primary underline underline-offset-2 hover:opacity-90"
            >
              {linkMatch[1]}
            </a>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </Fragment>
  );
}

export function InlineText({ text }: { text: string }) {
  return (
    <p className="text-sm leading-7 text-muted-foreground">
      {renderInline(text, 0)}
    </p>
  );
}
