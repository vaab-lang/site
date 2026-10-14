import { Blocks, Languages, Shield, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Reveal } from '@/components/Reveal'
import { VaabCode } from '@/components/VaabCode'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const FEATURES: {
  id: string
  icon: LucideIcon
  label: string
  title: string
  description: string
  detail: string
  code: string
  filename: string
  minHeight: string
}[] = [
  {
    id: 'syntax',
    icon: Languages,
    label: 'Syntax',
    title: 'Plain English on the page',
    description:
      'Functions are bare names. Booleans are `yes` and `no`. Strings interpolate with `{name}`.',
    detail: 'No arrow functions. No nested ternaries.',
    filename: 'greet.vaab',
    minHeight: '148px',
    code: `greet(name: Text) returns Text {
    if active yes {
        return "hi, {name}"
    }
    return "bye, {name}"
}`,
  },
  {
    id: 'types',
    icon: Shield,
    label: 'Types',
    title: 'Signatures checked before run',
    description:
      'Every parameter and return type is written down. Wrong types fail with a snippet and a caret.',
    detail: 'Fix type errors at compile time, not in production logs.',
    filename: 'deposit.vaab',
    minHeight: '168px',
    code: `cast Account {
    changing balance: Int = 0

    deposit(amount: Int) {
        self.balance = self.balance + amount
    }
}

# rejected: amount + "oops"`,
  },
  {
    id: 'concurrency',
    icon: Zap,
    label: 'Concurrency',
    title: 'Tasks, channels, and sendability',
    description:
      '`start`, `send ... to`, `receive from`, `together`, and `select` are in the language. Values entering a task must be sendable.',
    detail: 'A `let changing` name cannot enter a task. Use `Shared.new(...)` instead.',
    filename: 'inbox.vaab',
    minHeight: '200px',
    code: `let inbox = Channel.new(of: Text, size: 10)
let job = start { fetch(url) }

send "ping" to inbox
let msg = receive from inbox

select {
    when receive from inbox as message { handle(message) }
    when timeout after 2 seconds { print("quiet") }
}`,
  },
  {
    id: 'io',
    icon: Blocks,
    label: 'I/O',
    title: 'Servers that stay up',
    description:
      'JSON in both directions, bytes, SQLite transactions, and WebSockets are in the language. A slow HTTP call parks the task instead of the thread.',
    detail: '`on start` lives for the process. `Hub.broadcast` drops a slow client instead of waiting on it.',
    filename: 'server.vaab',
    minHeight: '280px',
    code: `let count = Shared.new(0)
let hub = Hub.new(of: Text)

tick() {
    count.update(n -> n + 1)
    hub.broadcast("{count.value}")
}

serve on port 8080 {
    on start {
        start { every(milliseconds: 1000, f: tick) }
    }
    route get "/count" {
        reply with count.value
    }
    socket "/ws" as client {
        hub.join(client)
    }
}`,
  },
]

export function Features() {
  return (
    <section id="features" className="relative overflow-hidden border-t border-slate-800 bg-slate-950 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_0%,rgba(16,185,129,0.07),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="default" className="mb-6">
              Under the hood
            </Badge>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-50 sm:text-5xl md:text-6xl">
              Readable syntax is the start.{' '}
              <span className="text-gradient">The runtime is the rest.</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-slate-400 sm:text-lg">
              Vaab ships strict types, checked concurrency, and built-in I/O for
              the backends you deploy.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.id} delay={80 + index * 60}>
              <Card
                className={cn(
                  'flex h-full flex-col gap-0 overflow-hidden border-slate-800/80 bg-slate-900/30 p-0',
                  'transition-colors hover:border-slate-700 hover:bg-slate-900/50',
                )}
              >
                <div className="flex flex-col gap-4 p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
                        <feature.icon className="h-4 w-4 text-emerald-400" strokeWidth={1.75} />
                      </div>
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-emerald-500/80">
                        {feature.label}
                      </p>
                    </div>
                    <span className="font-mono text-sm tabular-nums text-slate-700">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <CardTitle className="text-xl leading-snug sm:text-2xl">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-slate-400 sm:text-base">
                    {feature.description}
                  </CardDescription>
                </div>

                <div className="relative border-t border-slate-800/80 bg-slate-950/50 px-4 py-4 sm:px-6 sm:py-5">
                  <div className="pointer-events-none absolute inset-y-4 left-0 w-0.5 rounded-full bg-gradient-to-b from-emerald-500/60 via-emerald-500/20 to-transparent" />
                  <VaabCode
                    code={feature.code}
                    filename={feature.filename}
                    minHeight={feature.minHeight}
                    className="rounded-xl border-slate-800"
                  />
                </div>

                <p className="border-t border-slate-800/80 px-6 py-4 text-sm leading-relaxed text-slate-500 sm:px-8">
                  {feature.detail}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
