import type { HistoryPoint } from '@/lib/riffs'
import { cn } from '@/lib/utils'

type Props = {
  history: HistoryPoint[]
  downloads: number
  views: number
  className?: string
  height?: number
}

function seriesPoints(
  history: HistoryPoint[],
  key: 'installs' | 'views',
  innerW: number,
  innerH: number,
  padX: number,
  padY: number,
  max: number,
) {
  return history.map((point, index) => {
    const x = padX + (index / Math.max(history.length - 1, 1)) * innerW
    const count = point[key]
    const y = padY + innerH - (count / max) * innerH
    return { x, y, count, date: point.date }
  })
}

export function DownloadChart({ history, downloads, views, className, height = 180 }: Props) {
  if (history.length === 0 && downloads === 0 && views === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-2xl border border-dashed border-slate-800 text-sm text-slate-500',
          className,
        )}
        style={{ height }}
      >
        No activity yet
      </div>
    )
  }

  const width = 640
  const padX = 8
  const padY = 12
  const innerW = width - padX * 2
  const innerH = height - padY * 2
  const max = Math.max(
    ...history.flatMap((point) => [point.installs, point.views]),
    downloads,
    views,
    1,
  )

  const installPts = seriesPoints(history, 'installs', innerW, innerH, padX, padY, max)
  const viewPts = seriesPoints(history, 'views', innerW, innerH, padX, padY, max)

  const installLine = installPts.map((point) => `${point.x},${point.y}`).join(' ')
  const viewLine = viewPts.map((point) => `${point.x},${point.y}`).join(' ')

  const installArea =
    installPts.length > 0
      ? `${installPts[0]!.x},${padY + innerH} ${installLine} ${installPts[installPts.length - 1]!.x},${padY + innerH}`
      : ''

  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/60', className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(16,185,129,0.12),transparent)]" />
      <div className="relative flex flex-wrap items-end justify-between gap-4 px-5 pt-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400/90">
            Activity
          </p>
          <p className="mt-1 text-sm text-slate-500">last 30 days</p>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/80">
              Installs
            </p>
            <p className="font-mono text-2xl font-bold tabular-nums text-slate-50 transition-all duration-300">
              {downloads.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400/80">
              Views
            </p>
            <p className="font-mono text-2xl font-bold tabular-nums text-slate-50 transition-all duration-300">
              {views.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="relative mt-2 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Install and view trend over the last 30 days"
      >
        <defs>
          <linearGradient id="riff-install-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(16,185,129,0.35)" />
            <stop offset="100%" stopColor="rgba(16,185,129,0)" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={padX}
            x2={width - padX}
            y1={padY + innerH * ratio}
            y2={padY + innerH * ratio}
            stroke="rgba(148,163,184,0.08)"
            strokeWidth="1"
          />
        ))}
        {installArea && <polygon points={installArea} fill="url(#riff-install-area)" />}
        {installLine && (
          <polyline
            points={installLine}
            fill="none"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {viewLine && (
          <polyline
            points={viewLine}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray="6 4"
          />
        )}
      </svg>
      <div className="relative flex gap-4 px-5 pb-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-emerald-400" />
          Installs
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded border-t-2 border-dashed border-cyan-400" />
          Views
        </span>
      </div>
    </div>
  )
}
