import { Code2, ExternalLink } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RIFF_ORIGIN, TODO_PATH } from '@/lib/app-mode'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/#features', label: 'Features', homeOnly: true },
  { href: '/#performance', label: 'Performance', homeOnly: true },
  { href: RIFF_ORIGIN, label: 'Riffs', homeOnly: false, external: true },
  { href: TODO_PATH, label: 'Todos', homeOnly: false },
  { href: '/spec', label: 'Spec', homeOnly: false },
  { href: '/decisions', label: 'Decisions', homeOnly: false },
  { href: '/changelog', label: 'Changelog', homeOnly: false },
] as const

function NavLink({
  href,
  label,
  external = false,
}: {
  href: string
  label: string
  external?: boolean
}) {
  const location = useLocation()
  const isRoute = href.startsWith('/') && !href.includes('#') && !external
  const active = isRoute
    ? location.pathname === href
    : location.pathname === '/' && location.hash === href.replace('/', '')

  const className = cn(
    'transition-colors hover:text-slate-100',
    active ? 'text-emerald-400' : 'text-slate-400',
  )

  if (isRoute) {
    return (
      <Link to={href} className={className}>
        {label}
      </Link>
    )
  }

  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {label}
    </a>
  )
}

export function Header() {
  const location = useLocation()
  const onDocPage =
    location.pathname === '/spec' ||
    location.pathname === '/decisions' ||
    location.pathname === '/changelog' ||
    false

  return (
    <nav className="fixed top-0 z-40 w-full border-b border-slate-800/70 bg-slate-950/90 py-4 backdrop-blur-md md:border-b-0 md:bg-transparent md:py-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 font-bold tracking-tight text-slate-100">
          <div className="shrink-0 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-2 text-slate-950 shadow-lg shadow-emerald-500/20">
            <Code2 size={18} strokeWidth={3} />
          </div>
          <span className="truncate text-xl leading-none">Vaab</span>
          <Badge variant="secondary" className="hidden normal-case sm:inline-flex">
            v0.1.4
          </Badge>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-semibold md:flex lg:gap-8">
          {NAV.filter((item) => !onDocPage || !item.homeOnly).map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              external={'external' in item ? item.external : false}
            />
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://github.com/vaab-lang/vaab"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </Button>
          <Button size="sm" asChild>
            <Link to="/#playground">Try Vaab</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
