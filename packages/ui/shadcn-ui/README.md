# AI TOOLKIT shadcn/ui

Primitives for the AI Elements component library, ported from `vercel/ai-elements`
(`packages/shadcn-ui`) and adapted to the AI TOOLKIT monorepo. Components are
Tailwind-styled `data-slot` primitives consumed by `@ai-toolkit/elements`.

**Stability**: beta
**Owner**: @khulnasoft/ai-react-team

## Components

Accordion, Alert, Avatar, Badge, Button, ButtonGroup, Card, Carousel,
Collapsible, Command, Dialog, DropdownMenu, HoverCard, Input, InputGroup,
Popover, Progress, ScrollArea, Select, Separator, Spinner, Switch, Tabs,
Textarea, Tooltip, plus the `cn` utility (`lib/utils`).

## Install

```bash
pnpm add @ai-toolkit/shadcn-ui ai-toolkit
```

## Usage

```tsx
import { Button, cn } from '@ai-toolkit/shadcn-ui';

export function Example() {
  return <Button className={cn('rounded-full')}>Click me</Button>;
}
```

## Styling

Components ship as styled Tailwind primitives exposing `data-slot` attributes.
Requires Tailwind v4 with the shadcn/new-york CSS variables in your app.

## Source

Components originate from https://github.com/khulnasoft/ai-toolkit-elements
(`packages/shadcn-ui/components/ui`), Apache-2.0.
