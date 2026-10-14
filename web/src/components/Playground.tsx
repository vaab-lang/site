import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import {
  Binary,
  Braces,
  Calculator,
  Copy,
  Database,
  FileJson,
  Hand,
  Layers,
  Loader2,
  Play,
  RotateCcw,
  Shapes,
  Terminal,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useCallback, useState } from 'react'

import { Reveal } from '@/components/Reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { runVaab, type RunResponse } from '@/lib/api'
import { DEFAULT_SOURCE, EXAMPLES, type Example } from '@/lib/examples'
import { vaabLanguageSupport } from '@/lib/vaab-language'
import { cn } from '@/lib/utils'

const EXAMPLE_ICONS: Record<string, LucideIcon> = {
  hello: Hand,
  collections: Layers,
  casts: Shapes,
  query: Database,
  numbers: Calculator,
  json: FileJson,
  bytes: Binary,
  match: Braces,
}

const editorExtensions = [vaabLanguageSupport]

export function Playground() {
  const [source, setSource] = useState(DEFAULT_SOURCE)
  const [activeExample, setActiveExample] = useState('hello')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<RunResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const handleRun = useCallback(async () => {
    setRunning(true)
    try {
      const response = await runVaab(source)
      setResult(response)
    } catch {
      setResult({
        status: 'error',
        phase: 'run',
        message:
          'Could not reach the Vaab server. Start it with: vaab serve main.vaab',
      })
    } finally {
      setRunning(false)
    }
  }, [source])

  const loadExample = (example: Example) => {
    setSource(example.source)
    setActiveExample(example.id)
    setResult(null)
  }

  const reset = () => {
    loadExample(EXAMPLES[0]!)
  }

  const copySource = async () => {
    await navigator.clipboard.writeText(source)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const stdout =
    result?.status === 'ok' ? result.stdout.filter((line) => line.length > 0) : []

  return (
    <section id="playground" className="relative border-t border-slate-800 bg-slate-950 py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_0%,rgba(99,102,241,0.06),transparent)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="default" className="mb-6">
              Interactive
            </Badge>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-50 sm:text-5xl">
              Try Vaab in the browser.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-400 sm:text-lg">
              Edit the code, press Run. The same parser, checker, and VM as{' '}
              <code className="rounded-md border border-slate-800 bg-slate-900 px-1.5 py-0.5 font-mono text-sm text-emerald-400">
                vaab run
              </code>
              .
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-12 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40">
            <div className="flex flex-col gap-4 border-b border-slate-800/80 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((example) => {
                  const Icon = EXAMPLE_ICONS[example.id] ?? Hand
                  const active = activeExample === example.id
                  return (
                    <button
                      key={example.id}
                      type="button"
                      onClick={() => loadExample(example)}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold motion-safe:transition-all motion-safe:duration-200',
                        active
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.12)]'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200',
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {example.label}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center gap-2 self-end lg:self-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={reset} className="h-9 w-9">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset to Hello</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={copySource} className="h-9 w-9">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{copied ? 'Copied' : 'Copy source'}</TooltipContent>
                </Tooltip>

                <Button
                  onClick={handleRun}
                  disabled={running}
                  className="min-w-[5.5rem] shadow-[0_0_24px_rgba(16,185,129,0.2)]"
                >
                  {running ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Run
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Run
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2">
              <div className="min-h-[320px] border-b border-slate-800/80 lg:min-h-[420px] lg:border-b-0 lg:border-r">
                <CodeMirror
                  value={source}
                  height="100%"
                  minHeight="320px"
                  theme={oneDark}
                  extensions={editorExtensions}
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: false,
                    highlightActiveLine: true,
                    indentOnInput: true,
                    bracketMatching: true,
                  }}
                  onChange={(value) => {
                    setSource(value)
                    setActiveExample('')
                    if (result) setResult(null)
                  }}
                  className="h-full [&_.cm-editor]:min-h-[320px] [&_.cm-editor]:bg-slate-950/40 [&_.cm-editor]:py-3 [&_.cm-gutters]:border-r-slate-800/80 [&_.cm-gutters]:bg-slate-950/60 [&_.cm-scroller]:font-mono"
                />
              </div>

              <div className="flex min-h-[280px] flex-col bg-slate-950/30 lg:min-h-[420px]">
                <Tabs defaultValue="output" className="flex h-full flex-col">
                  <div className="border-b border-slate-800/80 px-4 pt-3 sm:px-5">
                    <TabsList className="h-9 rounded-full border border-slate-800 bg-slate-900/80 p-1">
                      <TabsTrigger
                        value="output"
                        className="rounded-full text-xs font-semibold data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100"
                      >
                        <Terminal className="mr-1.5 h-3.5 w-3.5" />
                        Output
                      </TabsTrigger>
                      <TabsTrigger
                        value="result"
                        className="rounded-full text-xs font-semibold data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100"
                      >
                        Result
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="output" className="m-0 flex-1 p-4 sm:p-5">
                    {!result && (
                      <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
                          <Terminal className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
                        </div>
                        <p className="font-mono text-sm text-slate-500">Press Run to execute.</p>
                      </div>
                    )}

                    {result?.status === 'ok' && stdout.length === 0 && (
                      <p className="font-mono text-sm text-slate-500">(no printed output)</p>
                    )}

                    {result?.status === 'ok' && stdout.length > 0 && (
                      <pre className="font-mono text-sm leading-relaxed text-emerald-400">
                        {stdout.join('\n')}
                      </pre>
                    )}

                    {result?.status === 'error' && (
                      <div>
                        <Badge variant="outline" className="mb-3 normal-case">
                          {result.phase} error
                        </Badge>
                        <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-rose-400">
                          {result.message}
                        </pre>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="result" className="m-0 flex-1 p-4 sm:p-5">
                    {!result && (
                      <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
                        <p className="font-mono text-sm text-slate-500">
                          The final value shows here after Run.
                        </p>
                      </div>
                    )}

                    {result?.status === 'ok' && (
                      <pre
                        className={cn(
                          'font-mono text-sm leading-relaxed',
                          result.result === 'nothing'
                            ? 'text-slate-500'
                            : 'text-emerald-400',
                        )}
                      >
                        {result.result}
                      </pre>
                    )}

                    {result?.status === 'error' && (
                      <p className="font-mono text-sm text-slate-500">
                        Fix the error first.
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </Reveal>

        <p className="mt-5 text-center font-mono text-xs text-slate-600">
          Vaab VM · edit freely, then Run
        </p>
      </div>
    </section>
  )
}
