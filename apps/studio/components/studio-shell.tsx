'use client';

import {
  Activity,
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Cpu,
  Github,
  Globe2,
  LayoutDashboard,
  LayoutTemplate,
  Layers,
  Menu,
  Moon,
  Search,
  Settings2,
  Sparkles,
  Waypoints,
  Wrench,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CommandPalette } from './command-palette';
import type { SearchItem } from '@/lib/types';

type NavItem = { label: string; href: string; icon: typeof Cpu };
const primary: NavItem[] = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Gateways', href: '/gateways', icon: Waypoints },
  { label: 'Models', href: '/models', icon: Cpu },
  { label: 'Providers', href: '/providers', icon: Layers },
  { label: 'Tools', href: '/tools', icon: Wrench },
  { label: 'Templates', href: '/templates', icon: LayoutTemplate },
];
const secondary: NavItem[] = [
  { label: 'Activity', href: '/activity', icon: Activity },
  { label: 'Settings', href: '/settings', icon: Settings2 },
];
const destinations = [
  {
    label: 'Documentation',
    href: 'https://studio.khulnasoft.com/docs',
    icon: BookOpen,
  },
  { label: 'Toolkit site', href: 'https://khulnasoft.com', icon: Globe2 },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 font-semibold tracking-tight"
    >
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Sparkles className="size-4" />
      </span>
      {!compact && <span>AI Toolkit</span>}
    </Link>
  );
}

function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const render = (item: NavItem) => {
    const Icon = item.icon;
    const active = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        className={cn(
          'group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          active
            ? 'bg-surface-200 font-medium text-foreground'
            : 'text-muted-foreground hover:bg-surface-200 hover:text-foreground',
          collapsed && 'justify-center px-2',
        )}
      >
        <Icon
          className={cn(
            'size-4 shrink-0',
            active
              ? 'text-primary'
              : 'text-muted-foreground group-hover:text-foreground',
          )}
        />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-5">
      <p className={cn('eyebrow mb-2 px-2', collapsed && 'sr-only')}>
        Platform
      </p>
      <div className="flex flex-col gap-1">{primary.map(render)}</div>
      <p className={cn('eyebrow mb-2 mt-7 px-2', collapsed && 'sr-only')}>
        Workspace
      </p>
      <div className="flex flex-col gap-1">{secondary.map(render)}</div>
      {!collapsed && (
        <>
          <p className="eyebrow mb-2 mt-7 px-2">Resources</p>
          <div className="flex flex-col gap-1">
            {destinations.map(item => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={onNavigate}
                  className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-200 hover:text-foreground"
                >
                  <Icon className="size-4" />
                  <span className="flex-1">{item.label}</span>
                  <ArrowUpRight className="size-3" />
                </a>
              );
            })}
          </div>
        </>
      )}
    </nav>
  );
}

export function StudioShell({
  items,
  children,
}: {
  items: SearchItem[];
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col transition-[padding] lg:pl-60',
        collapsed && 'lg:pl-[4.5rem]',
      )}
    >
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-alpha-border bg-background transition-[width] lg:flex',
          collapsed ? 'w-[4.5rem]' : 'w-60',
        )}
      >
        <div
          className={cn(
            'flex h-16 items-center border-b border-alpha-border px-4',
            collapsed ? 'justify-center' : 'justify-between',
          )}
        >
          <Brand compact={collapsed} />
          <button
            onClick={() => setCollapsed(value => !value)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-200 hover:text-foreground"
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        </div>
        <SidebarNav collapsed={collapsed} />
        {!collapsed && (
          <div className="border-t border-alpha-border px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Seed data · read-only
          </div>
        )}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-background/80"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-alpha-border bg-background">
            <div className="flex h-16 items-center justify-between border-b border-alpha-border px-4">
              <Brand />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="rounded-md p-2 text-muted-foreground hover:bg-surface-200"
              >
                <X className="size-4" />
              </button>
            </div>
            <SidebarNav
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-alpha-border-strong bg-surface-200/85 px-4 backdrop-blur lg:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-muted-foreground hover:bg-surface-300 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </button>
          <div className="flex-1 lg:hidden">
            <Brand />
          </div>
          <div className="min-w-0 flex-1 lg:max-w-xl">
            <CommandPalette items={items} />
          </div>
          <div className="hidden items-center gap-1 md:flex">
            <a
              href="https://studio.khulnasoft.com/docs"
              target="_blank"
              rel="noreferrer"
              aria-label="Documentation"
              className="rounded-md p-2 text-muted-foreground hover:bg-surface-300 hover:text-foreground"
            >
              <CircleHelp className="size-4" />
            </a>
            <a
              href="https://github.com/khulnasoft/ai-toolkit"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="rounded-md p-2 text-muted-foreground hover:bg-surface-300 hover:text-foreground"
            >
              <Github className="size-4" />
            </a>
            <button
              aria-label="Toggle theme"
              className="rounded-md p-2 text-muted-foreground hover:bg-surface-300 hover:text-foreground"
            >
              <Moon className="size-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
