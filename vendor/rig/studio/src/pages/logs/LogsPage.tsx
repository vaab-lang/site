import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { DataGrid } from '@/components/DataGrid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { menuLinkFromPath } from '@/lib/studio-nav'
import { useRoleStore } from '@/lib/role-store'
import {
  bucketLogs,
  DEFAULT_LOG_SQL,
  filterLogs,
  intervalRange,
  LOG_SERVICE_BY_PATH,
  logToRow,
  queryLogs,
  type IntervalKey,
  type StudioLog,
} from '@/lib/platform-api'
import { CHART, ErrorBanner, IntervalToggle, MetricChart, PageHeader } from '@/pages/home/ui'

export function LogsPage() {
  const { pathname } = useLocation()
  const role = useRoleStore((state) => state.role)
  const service = LOG_SERVICE_BY_PATH[pathname]
  const title = menuLinkFromPath(pathname)?.label ?? 'Explorer'
  const [interval, setInterval] = useState<IntervalKey>('24h')
  const [q, setQ] = useState('')
  const [sql, setSql] = useState(
    service
      ? `select id, ts, service, level, status_code, method, path, msg, duration_ms from studio_logs where service = '${service}' order by ts desc limit 100`
      : DEFAULT_LOG_SQL,
  )
  const [fromOverride, setFromOverride] = useState<string | null>(null)
  const [detail, setDetail] = useState<StudioLog | null>(null)
  const range = intervalRange(interval)
  const from = fromOverride ?? range.from

  const logs = useQuery({
    queryKey: ['studio', 'logs', pathname, service, q, from, range.to, role],
    queryFn: () =>
      queryLogs(
        {
          service: service ?? '',
          level: '',
          sql: sql.trim(),
        },
        role,
      ),
  })

  const rows = useMemo(() => filterLogs(logs.data ?? [], { service, q, from, to: range.to }), [logs.data, service, q, from, range.to])
  const histogram = bucketLogs(rows, interval)

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title={title}
        detail="Query studio_logs. Click a histogram bar to narrow the window."
        actions={<IntervalToggle value={interval} onChange={(value) => { setInterval(value); setFromOverride(null) }} />}
      />
      <ErrorBanner error={logs.error instanceof Error ? logs.error.message : null} onRetry={() => void logs.refetch()} />

      <div className="mb-3 grid gap-2">
        <Textarea
          aria-label="Log SQL"
          className="font-mono text-[13px]"
          value={sql}
          onChange={(event) => setSql(event.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Filter"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="max-w-xs"
          />
          <Button type="button" onClick={() => void logs.refetch()}>
            Run
          </Button>
        </div>
      </div>

      <div className="mb-3">
        <MetricChart
          title="Volume"
          data={histogram}
          color={CHART[1]}
          empty="No logs in this window"
          onPointClick={(_, index) => {
            const point = histogram[index]
            if (point) setFromOverride(new Date(point.start).toISOString())
          }}
        />
      </div>

      <LogTable
        rows={rows}
        loading={logs.isLoading}
        error={logs.error instanceof Error ? logs.error.message : null}
        onSelect={setDetail}
      />

      <Sheet open={Boolean(detail)} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Log</SheetTitle>
          </SheetHeader>
          <pre className="overflow-auto p-4 font-mono text-[13px]">{detail ? JSON.stringify(detail, null, 2) : ''}</pre>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function LogTable({
  rows,
  loading,
  error,
  onSelect,
}: {
  rows: StudioLog[]
  loading: boolean
  error: string | null
  onSelect: (log: StudioLog) => void
}) {
  if (loading || error) {
    return (
      <DataGrid
        columns={['ts', 'service', 'level', 'status_code', 'method', 'path', 'msg', 'duration_ms']}
        rows={rows.map(logToRow)}
        loading={loading}
        error={error}
        empty="No logs in this window"
      />
    )
  }
  if (rows.length === 0) {
    return <p className="rounded-md border border-border bg-surface px-4 py-8 text-center text-sm text-muted-foreground">No logs in this window</p>
  }
  return (
    <div className="overflow-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-3 py-2">ts</th>
            <th className="px-3 py-2">service</th>
            <th className="px-3 py-2">level</th>
            <th className="px-3 py-2">status</th>
            <th className="px-3 py-2">method</th>
            <th className="px-3 py-2">path</th>
            <th className="px-3 py-2">msg</th>
            <th className="px-3 py-2">ms</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="cursor-pointer border-b border-border hover:bg-elevated" onClick={() => onSelect(row)}>
              <td className="whitespace-nowrap px-3 py-2 font-mono text-[12px]">{row.ts}</td>
              <td className="px-3 py-2 font-mono text-[12px]">{row.service}</td>
              <td className="px-3 py-2 font-mono text-[12px]">{row.level}</td>
              <td className="px-3 py-2 font-mono text-[12px]">{row.status_code}</td>
              <td className="px-3 py-2 font-mono text-[12px]">{row.method}</td>
              <td className="max-w-[180px] truncate px-3 py-2 font-mono text-[12px]">{row.path}</td>
              <td className="max-w-[280px] truncate px-3 py-2 font-mono text-[12px]">{row.msg}</td>
              <td className="px-3 py-2 font-mono text-[12px]">{row.duration_ms}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
