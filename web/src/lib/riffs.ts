export type DownloadPoint = {
  date: string
  count: number
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
}

export type RiffWithStats = RiffPackage & {
  history: DownloadPoint[]
}

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
  }
}

function historyFromApi(rows: Record<string, unknown>[]): DownloadPoint[] {
  return rows
    .map((row) => ({
      date: typeof row.day === 'string' ? row.day : '',
      count: Number(typeof row.count === 'string' ? row.count : row.count ?? 0),
    }))
    .filter((point) => point.date.length > 0)
}

export async function trackInstall(name: string): Promise<void> {
  try {
    await fetch(`/api/riffs/${encodeURIComponent(name)}/track`, { method: 'POST' })
  } catch {
    // Best-effort analytics.
  }
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

  return withHistory.sort((a, b) => b.downloads - a.downloads)
}

async function fetchHistory(name: string): Promise<DownloadPoint[]> {
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

export async function getRiffWithStats(name: string): Promise<RiffWithStats | null> {
  const response = await fetch(`/api/riffs/${encodeURIComponent(name)}`)
  if (!response.ok) return null
  const row = (await response.json()) as Record<string, unknown>
  const pkg = packageFromApi(row)
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
