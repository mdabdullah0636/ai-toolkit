import { Panel } from '@ai-toolkit/design/panel';

const points =
  '0,118 34,105 68,110 102,80 136,91 170,66 204,72 238,48 272,58 306,33 340,42 374,20';

export function OverviewAnalytics() {
  return (
    <Panel
      title="Requests · Last 30 days"
      aside={<span className="eyebrow">+18.4% vs previous</span>}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-3xl font-semibold tabular-nums tracking-tight">
            2.84M
          </p>
          <p className="mt-1 text-sm text-muted-foreground">total requests</p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-alpha-border bg-surface-200 p-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <button className="rounded bg-surface-300 px-2 py-1 text-foreground">
            30d
          </button>
          <button className="px-2 py-1 hover:text-foreground">7d</button>
          <button className="px-2 py-1 hover:text-foreground">24h</button>
        </div>
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-alpha-border bg-background/40 p-3">
        <svg
          viewBox="0 0 374 140"
          className="h-48 w-full"
          role="img"
          aria-label="Requests trend increasing over the last 30 days"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="request-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity=".18" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[20, 52, 84, 116].map(y => (
            <line
              key={y}
              x1="0"
              x2="374"
              y1={y}
              y2={y}
              stroke="currentColor"
              className="text-alpha-border"
              strokeWidth=".7"
            />
          ))}
          <polygon
            points={`${points} 374,140 0,140`}
            fill="url(#request-fill)"
            className="text-primary"
          />
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            className="text-primary"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="flex justify-between px-1 font-mono text-[10px] text-muted-foreground">
          <span>Aug 14</span>
          <span>Aug 21</span>
          <span>Aug 28</span>
          <span>Sep 12</span>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-alpha-border pt-4 sm:grid-cols-4">
        {[
          ['P50 latency', '412ms'],
          ['P99 latency', '1.8s'],
          ['Est. cost', '$18.42k'],
          ['Availability', '99.98%'],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="font-mono text-sm font-medium tabular-nums">
              {value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
