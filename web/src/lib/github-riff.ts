import type { RiffPackage } from '@/lib/riffs'

export type ParsedGithubRepo = {
  owner: string
  repo: string
  normalizedUrl: string
}

export function parseGithubRepoUrl(input: string): ParsedGithubRepo | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`)
    if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') return null
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length < 2) return null
    const owner = parts[0]
    const repo = parts[1].replace(/\.git$/i, '')
    if (!owner || !repo) return null
    return {
      owner,
      repo,
      normalizedUrl: `https://github.com/${owner}/${repo}`,
    }
  } catch {
    return null
  }
}

type ManifestFields = {
  name: string
  version: string
  description: string
  author: string
  licence: string
  needs: string
  tags: string
}

function parseRiffManifest(text: string): ManifestFields | null {
  const lines = text.split('\n').map((line) => line.trim())
  const header = lines.find((line) => line && !line.startsWith('#'))
  if (!header?.startsWith('riff ')) return null

  const headerParts = header.split(/\s+/)
  if (headerParts.length < 3) return null
  const name = headerParts[1]
  const version = headerParts[2]

  let description = ''
  let author = ''
  let licence = ''
  let needs = ''

  for (const line of lines) {
    if (line.startsWith('description ')) description = line.slice('description '.length)
    if (line.startsWith('by ')) author = line.slice('by '.length)
    if (line.startsWith('licence ')) licence = line.slice('licence '.length)
    if (line.startsWith('needs vaab at ')) needs = `vaab at ${line.slice('needs vaab at '.length)}`
  }

  return {
    name,
    version,
    description,
    author,
    licence,
    needs,
    tags: 'community',
  }
}

async function fetchRawRiff(owner: string, repo: string, branch: string): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/riff`
  const response = await fetch(url)
  if (!response.ok) return null
  return response.text()
}

export async function loadRiffFromGithubUrl(repoUrl: string): Promise<ManifestFields & { repo: string }> {
  const parsed = parseGithubRepoUrl(repoUrl)
  if (!parsed) {
    throw new Error('Paste a GitHub repository URL (https://github.com/owner/repo).')
  }

  for (const branch of ['main', 'master']) {
    const manifestText = await fetchRawRiff(parsed.owner, parsed.repo, branch)
    if (!manifestText) continue
    const fields = parseRiffManifest(manifestText)
    if (!fields) continue
    if (fields.name !== parsed.repo) {
      // Allow monorepo paths later; for now warn via description suffix.
      fields.description = fields.description || `Package from ${parsed.normalizedUrl}`
    }
    return { ...fields, repo: parsed.normalizedUrl }
  }

  throw new Error(
    `Could not find a riff manifest at ${parsed.normalizedUrl} (tried main/riff and master/riff).`,
  )
}

export async function registerRiffFromGithub(repoUrl: string): Promise<RiffPackage> {
  const manifest = await loadRiffFromGithubUrl(repoUrl)
  const response = await fetch('/api/riffs/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(manifest),
  })
  if (!response.ok) {
    throw new Error(await response.text())
  }
  const row = (await response.json()) as Record<string, unknown>
  return {
    name: String(row.name ?? manifest.name),
    version: String(row.version ?? manifest.version),
    description: String(row.description ?? manifest.description),
    author: String(row.author ?? manifest.author),
    licence: String(row.licence ?? manifest.licence),
    repo: String(row.repo ?? manifest.repo),
    needs: String(row.needs ?? manifest.needs),
    tags: String(row.tags ?? manifest.tags),
    downloads: Number(row.downloads ?? 0),
    views: Number(row.views ?? 0),
  }
}
