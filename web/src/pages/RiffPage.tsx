import { ArrowUpRight, Download, Eye, Package, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { DownloadChart } from '@/components/riff/DownloadChart'
import { RiffHeader } from '@/components/riff/RiffHeader'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { listRiffsWithStats, LIVE_POLL_MS, riffTags, type RiffWithStats } from '@/lib/riffs'
import { cn } from '@/lib/utils'

function formatDownloads(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`
  return count.toLocaleString()
}

export function RiffPage() {
  const [query, setQuery] = useState('')
  const [packages, setPackages] = useState<RiffWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function refresh(initial: boolean) {
      try {
        const rows = await listRiffsWithStats()
        if (!cancelled) {
          setPackages(rows)
          setError(null)
        }
      } catch (err) {
        if (!cancelled && initial) {
          setError(err instanceof Error ? err.message : 'could not load catalog')
        }
      } finally {
        if (!cancelled && initial) setLoading(false)
      }
    }

    void refresh(true)
    const timer = window.setInterval(() => void refresh(false), LIVE_POLL_MS * 2)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return packages
    return packages.filter((pkg) => {
      const tags = riffTags(pkg)
      return (
        pkg.name.includes(needle) ||
        pkg.description.toLowerCase().includes(needle) ||
        tags.some((tag) => tag.includes(needle))
      )
    })
  }, [packages, query])

  const totalDownloads = packages.reduce((sum, pkg) => sum + pkg.downloads, 0)
  const totalViews = packages.reduce((sum, pkg) => sum + pkg.views, 0)
  const topHistory = packages[0]?.history ?? []
  const topViews = packages[0]?.views ?? 0
  const topDownloads = packages[0]?.downloads ?? 0

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-15%,rgba(16,185,129,0.09),transparent)]" />
      <RiffHeader />

      <main className="relative mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 md:pt-32">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <Badge variant="accent" className="mb-5">
              <Package className="h-3 w-3" />
              Package registry
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-50 sm:text-5xl">
              Find a <span className="text-gradient">riff</span> for your app
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-400">
              Official Vaab packages backed by{' '}
              <code className="font-mono text-sm text-emerald-400">rig</code> and Postgres.
              Search by name or tag, read live install counts, copy a command, and add it to
              your manifest.
            </p>

            <div className="relative mt-8 max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search riffs…"
                className="h-14 pl-12 text-base"
                aria-label="Search riffs"
              />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              {loading
                ? 'Loading catalog…'
                : `${filtered.length} riff${filtered.length === 1 ? '' : 's'} · ${formatDownloads(totalViews)} views · ${formatDownloads(totalDownloads)} installs`}
            </p>
            {error && (
              <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </p>
            )}
          </div>

          <DownloadChart
            history={topHistory}
            downloads={topDownloads}
            views={topViews}
            className="lg:mb-2"
            height={180}
          />
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading &&
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-2xl border border-slate-800/80 bg-slate-900/40"
              />
            ))}

          {!loading &&
            filtered.map((pkg) => (
              <Link
                key={pkg.name}
                to={`/packages/${pkg.name}`}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 transition-all',
                  'hover:border-emerald-500/40 hover:bg-slate-900/70 hover:shadow-lg hover:shadow-emerald-950/20',
                )}
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl transition-opacity group-hover:opacity-100" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-mono text-lg font-bold text-emerald-400">{pkg.name}</h2>
                    <p className="mt-1 font-mono text-xs text-slate-500">v{pkg.version}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-600 transition-colors group-hover:text-emerald-400" />
                </div>
                <p className="relative mt-3 line-clamp-2 text-sm leading-relaxed text-slate-400">
                  {pkg.description}
                </p>
                <div className="relative mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/60 px-2.5 py-1 font-mono text-xs text-slate-400">
                    <Eye className="h-3 w-3 text-cyan-400/80" />
                    {formatDownloads(pkg.views)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/60 px-2.5 py-1 font-mono text-xs text-slate-400">
                    <Download className="h-3 w-3 text-emerald-400/80" />
                    {formatDownloads(pkg.downloads)}
                  </span>
                  {riffTags(pkg).slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-800 px-2.5 py-1 text-xs text-slate-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
        </div>

        {!loading && filtered.length === 0 && (
          <p className="mt-10 rounded-2xl border border-dashed border-slate-800 px-6 py-12 text-center text-slate-500">
            No riffs match &ldquo;{query.trim()}&rdquo;. Try another name or tag.
          </p>
        )}
      </main>
    </div>
  )
}
