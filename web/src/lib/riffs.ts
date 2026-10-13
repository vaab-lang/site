import { RIFF_CATALOG, getRiff, type RiffPackage } from '@/lib/riffs-catalog'

export type DownloadPoint = {
  date: string
  count: number
}

export type RiffStats = {
  name: string
  downloads: number
  history: DownloadPoint[]
}

export type RiffWithStats = RiffPackage & {
  downloads: number
  history: DownloadPoint[]
}

type RiffRow = {
  name?: string
  downloads?: number
  kind?: string
  id?: string
  ts?: string
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

function formatDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Deterministic daily curve from seed + live total for the sparkline. */
export function synthesizeHistory(name: string, total: number): DownloadPoint[] {
  const days = 30
  const seed = hashString(name)
  const weights: number[] = []
  let weightSum = 0

  for (let i = 0; i < days; i += 1) {
    const wave = 0.55 + 0.45 * Math.sin((seed % 17) * 0.3 + i * 0.42)
    const drift = 0.7 + (i / days) * 0.6
    const weight = Math.max(0.15, wave * drift)
    weights.push(weight)
    weightSum += weight
  }

  const points: DownloadPoint[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(today)
    day.setDate(today.getDate() - i)
    const index = days - 1 - i
    const count = Math.max(0, Math.round((total * weights[index]!) / weightSum))
    points.push({ date: formatDay(day), count })
  }

  return points
}

/** Parses either `[RiffStat]` (`{ name, downloads }`) or raw `riff_events` rows from GET /api/riffs. */
function tallyDownloads(rows: RiffRow[]): Record<string, number> {
  const live: Record<string, number> = {}
  for (const row of rows) {
    const name = row.name
    if (!name) continue
    if (typeof row.downloads === 'number') {
      live[name] = row.downloads
    } else {
      live[name] = (live[name] ?? 0) + 1
    }
  }
  return live
}

async function fetchLiveDownloads(): Promise<Record<string, number>> {
  try {
    const response = await fetch('/api/riffs')
    if (!response.ok) return {}
    const rows = (await response.json()) as RiffRow[]
    if (!Array.isArray(rows)) return {}
    return tallyDownloads(rows)
  } catch {
    return {}
  }
}

async function fetchStats(name: string): Promise<{ downloads: number } | null> {
  try {
    const response = await fetch(`/api/riffs/${encodeURIComponent(name)}`)
    if (!response.ok) return null
    const data = (await response.json()) as RiffRow
    if (typeof data.downloads === 'number') {
      return { downloads: data.downloads }
    }
    return null
  } catch {
    return null
  }
}

export async function trackInstall(name: string): Promise<void> {
  try {
    await fetch(`/api/riffs/${encodeURIComponent(name)}/track`, { method: 'POST' })
  } catch {
    // Best-effort analytics.
  }
}

export async function listRiffsWithStats(): Promise<RiffWithStats[]> {
  const live = await fetchLiveDownloads()

  return RIFF_CATALOG.map((pkg) => {
    const downloads = live[pkg.name] ?? pkg.seedDownloads
    return {
      ...pkg,
      downloads,
      history: synthesizeHistory(pkg.name, downloads),
    }
  }).sort((a, b) => b.downloads - a.downloads)
}

export async function getRiffWithStats(name: string): Promise<RiffWithStats | null> {
  const pkg = getRiff(name)
  if (!pkg) return null

  const single = await fetchStats(name)
  if (single) {
    return {
      ...pkg,
      downloads: single.downloads,
      history: synthesizeHistory(name, single.downloads),
    }
  }

  const live = await fetchLiveDownloads()
  const downloads = live[name] ?? pkg.seedDownloads

  return {
    ...pkg,
    downloads,
    history: synthesizeHistory(name, downloads),
  }
}

export function installCommand(name: string): string {
  return `riff install ${name}`
}

export function needCommand(name: string): string {
  return `vaab need ${name}`
}
