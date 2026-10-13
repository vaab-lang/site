import { ExternalLink, Package } from 'lucide-react'
import { Link } from 'react-router-dom'

import { SITE_ORIGIN } from '@/lib/app-mode'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function RiffHeader() {
  return (
    <nav className="fixed top-0 z-40 w-full border-b border-slate-800/70 bg-slate-950/90 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2.5 font-bold tracking-tight text-slate-100"
        >
          <div className="shrink-0 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-2 text-slate-950 shadow-lg shadow-emerald-500/20">
            <Package size={18} strokeWidth={2.5} />
          </div>
          <span className="truncate text-xl leading-none">Riff</span>
          <Badge variant="accent" className="hidden normal-case sm:inline-flex">
            rig · postgres
          </Badge>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-semibold md:flex">
          <Link to="/" className="text-emerald-400 transition-colors hover:text-emerald-300">
            Browse
          </Link>
          <a
            href={`${SITE_ORIGIN}/#install`}
            className="text-slate-400 transition-colors hover:text-slate-100"
          >
            Install Vaab
          </a>
          <a
            href="https://github.com/vaab-lang/rig"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 transition-colors hover:text-slate-100"
          >
            Rig
          </a>
          <a
            href="https://github.com/vaab-lang/tape"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 transition-colors hover:text-slate-100"
          >
            Tape
          </a>
          <a
            href="https://github.com/vaab-lang/vaab-riffs"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 transition-colors hover:text-slate-100"
          >
            Publish a riff
          </a>
        </div>

        <Button variant="ghost" size="sm" asChild>
          <a href={SITE_ORIGIN}>
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">vaab.dev</span>
          </a>
        </Button>
      </div>
    </nav>
  )
}
