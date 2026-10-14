import { ArrowLeft, ExternalLink, Eye, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { CopyInstall } from '@/components/riff/CopyInstall'
import { DownloadChart } from '@/components/riff/DownloadChart'
import { RiffHeader } from '@/components/riff/RiffHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  getRiffWithStats,
  installCommand,
  LIVE_POLL_MS,
  needCommand,
  riffTags,
  trackView,
  type RiffWithStats,
} from '@/lib/riffs'

export function RiffDetailPage() {
  const { name = '' } = useParams()
  const [pkg, setPkg] = useState<RiffWithStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const viewRecorded = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function refresh(recordView: boolean) {
      if (recordView && !viewRecorded.current && name) {
        viewRecorded.current = true
        const views = await trackView(name)
        if (views !== null && !cancelled) {
          setPkg((current) => (current ? { ...current, views } : current))
        }
      }
      const row = await getRiffWithStats(name)
      if (cancelled) return
      if (!row) {
        setMissing(true)
        setPkg(null)
      } else {
        setMissing(false)
        setPkg(row)
      }
      setLoading(false)
    }

    void refresh(true)
    const timer = window.setInterval(() => void refresh(false), LIVE_POLL_MS)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [name])

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_80%_0%,rgba(16,185,129,0.08),transparent)]" />
      <RiffHeader />

      <main className="relative mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6 md:pt-32">
        <Button variant="ghost" size="sm" asChild className="mb-8 -ml-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            All riffs
          </Link>
        </Button>

        {loading && (
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
            Loading {name}…
          </div>
        )}

        {!loading && missing && (
          <div className="rounded-2xl border border-dashed border-slate-800 px-6 py-16 text-center">
            <p className="text-lg font-semibold text-slate-300">Riff not found</p>
            <p className="mt-2 text-slate-500">
              <code className="font-mono text-emerald-400/80">{name}</code> is not in the
              catalog yet.
            </p>
            <Button className="mt-6" asChild>
              <Link to="/">Browse riffs</Link>
            </Button>
          </div>
        )}

        {!loading && pkg && (
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-mono text-4xl font-extrabold tracking-tight text-slate-50 sm:text-5xl">
                  {pkg.name}
                </h1>
                <Badge variant="secondary" className="normal-case">
                  v{pkg.version}
                </Badge>
              </div>
              <p className="mt-5 text-lg leading-relaxed text-slate-400">{pkg.description}</p>

              <p className="mt-4 inline-flex items-center gap-2 text-sm text-slate-500">
                <Eye className="h-4 w-4 text-cyan-400/80" />
                <span className="font-mono tabular-nums text-cyan-300">{pkg.views.toLocaleString()}</span>
                views · live
              </p>

              <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Author
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-slate-200">{pkg.author}</dd>
                </div>
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Licence
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-slate-200">{pkg.licence}</dd>
                </div>
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 px-4 py-3 sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Requires
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-emerald-400">{pkg.needs}</dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-2">
                {riffTags(pkg).map((tag) => (
                  <Badge key={tag} variant="outline" className="normal-case">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button variant="outline" className="mt-8" asChild>
                <a href={pkg.repo} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  View source
                </a>
              </Button>
            </div>

            <div className="space-y-5">
              <DownloadChart
                history={pkg.history}
                downloads={pkg.downloads}
                views={pkg.views}
              />
              <CopyInstall name={pkg.name} command={installCommand(pkg.name)} label="Install" />
              <CopyInstall
                name={pkg.name}
                command={needCommand(pkg.name)}
                label="Add to project"
              />
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5 font-mono text-sm leading-relaxed text-slate-400">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400/90">
                  riff manifest
                </p>
                <pre className="overflow-x-auto whitespace-pre text-[13px] text-slate-300">{`need ${pkg.name}`}</pre>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
