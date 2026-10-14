export type HistoryPoint = {
  date: string
  installs: number
  views: number
}

export type RiffPackage = {
  name: string
  version: string
  description: string
  author: string
  licence: string
  repo: string
  needs: string
  tags: string
  downloads: number
  views: number
}

export type RiffWithStats = RiffPackage & {
  history: HistoryPoint[]
}

const LIVE_POLL_MS = 4000

function parseTags(tags: string): string[] {
  return tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function packageFromApi(row: Record<string, unknown>): RiffPackage | null {
  const name = typeof row.name === 'string' ? row.name : ''
  if (!name) return null
  return {
    name,
    version: typeof row.version === 'string' ? row.version : '0.0.0',
    description: typeof row.description === 'string' ? row.description : '',
    author: typeof row.author === 'string' ? row.author : '',
    licence: typeof row.licence === 'string' ? row.licence : '',
    repo: typeof row.repo === 'string' ? row.repo : '',
    needs: typeof row.needs === 'string' ? row.needs : '',
    tags: typeof row.tags === 'string' ? row.tags : '',
    downloads: typeof row.downloads === 'number' ? row.downloads : Number(row.downloads ?? 0),
    views: typeof row.views === 'number' ? row.views : Number(row.views ?? 0),
  }
}

function historyFromApi(rows: Record<string, unknown>[]): HistoryPoint[] {
  return rows
    .map((row) => {
      const date = typeof row.day === 'string' ? row.day : ''
      const installs =
        row.installs !== undefined
          ? Number(row.installs)
          : row.count !== undefined
            ? Number(row.count)
            : 0
      const views = row.views !== undefined ? Number(row.views) : 0
      return { date, installs, views }
    })
    .filter((point) => point.date.length > 0)
}

export async function trackInstall(name: string): Promise<void> {
  try {
    await fetch(`/api/riffs/${encodeURIComponent(name)}/track`, { method: 'POST' })
  } catch {
    // Best-effort analytics.
  }
}

export async function trackView(name: string): Promise<number | null> {
  try {
    const response = await fetch(`/api/riffs/${encodeURIComponent(name)}/view`, { method: 'POST' })
    if (!response.ok) return null
    const data = (await response.json()) as { views?: number }
    return typeof data.views === 'number' ? data.views : null
  } catch {
    return null
  }
}

export async function fetchHistory(name: string): Promise<HistoryPoint[]> {
  try {
    const response = await fetch(`/api/riffs/${encodeURIComponent(name)}/history`)
    if (!response.ok) return []
    const rows = (await response.json()) as Record<string, unknown>[]
    if (!Array.isArray(rows)) return []
    return historyFromApi(rows)
  } catch {
    return []
  }
}

export async function fetchRiffPackage(name: string): Promise<RiffPackage | null> {
  const response = await fetch(`/api/riffs/${encodeURIComponent(name)}`)
  if (!response.ok) return null
  const row = (await response.json()) as Record<string, unknown>
  return packageFromApi(row)
}

export async function listRiffsWithStats(): Promise<RiffWithStats[]> {
  const response = await fetch('/api/riffs')
  if (!response.ok) {
    throw new Error(await response.text())
  }
  const rows = (await response.json()) as Record<string, unknown>[]
  if (!Array.isArray(rows)) return []

  const packages = rows
    .map((row) => packageFromApi(row))
    .filter((pkg): pkg is RiffPackage => pkg !== null)

  const withHistory = await Promise.all(
    packages.map(async (pkg) => {
      const history = await fetchHistory(pkg.name)
      return { ...pkg, history }
    }),
  )

  return withHistory.sort((a, b) => b.views + b.downloads - (a.views + a.downloads))
}

export async function getRiffWithStats(name: string): Promise<RiffWithStats | null> {
  const pkg = await fetchRiffPackage(name)
  if (!pkg) return null
  const history = await fetchHistory(name)
  return { ...pkg, history }
}

export function riffTags(pkg: RiffPackage): string[] {
  return parseTags(pkg.tags)
}

export function installCommand(name: string): string {
  return `riff install ${name}`
}

export function needCommand(name: string): string {
  return `vaab need ${name}`
}

export { LIVE_POLL_MS }
