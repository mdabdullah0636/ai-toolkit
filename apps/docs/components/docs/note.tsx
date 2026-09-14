import { Callout } from '@vercel/geistdocs/components/callout';
import type { ReactNode } from 'react';

export const Note = ({
  children,
  type,
  className,
}: {
  children: ReactNode;
  type?: 'warning' | 'error';
  className?: string;
}) => (
  <Callout
    className={className}
    type={type === 'warning' ? 'warn' : type === 'error' ? 'error' : 'info'}
  >
    {children}
  </Callout>
);
