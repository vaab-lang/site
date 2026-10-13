export type RiffPackage = {
  name: string
  version: string
  description: string
  author: string
  licence: string
  repo: string
  needs: string
  tags: string[]
  /** Fallback only when the live rig-backed API is unreachable. */
  seedDownloads: number
}

export const RIFF_CATALOG: RiffPackage[] = [
  {
    name: 'rig',
    version: '0.1.0',
    description:
      'Supabase-shaped backend helpers for Vaab — data API, auth adapter, object storage paths, and riff install tracking.',
    author: 'vaab-lang',
    licence: 'MIT',
    repo: 'https://github.com/vaab-lang/rig',
    needs: 'vaab at 0.1',
    tags: ['database', 'auth', 'storage', 'backend', 'supabase'],
    seedDownloads: 0,
  },
  {
    name: 'supabase',
    version: '0.1.0',
    description: 'PostgREST client over Vaab’s http.send builtin. Connect, fetch, insert, patch, and delete rows.',
    author: 'vaab',
    licence: 'MIT',
    repo: 'https://github.com/vaab-lang/vaab-riffs/tree/main/supabase',
    needs: 'vaab at 0.1',
    tags: ['database', 'api', 'supabase'],
    seedDownloads: 0,
  },
  {
    name: 'tape',
    version: '0.1.0',
    description: 'Static file helpers for Vaab HTTP servers. Serve dist folders without a reverse proxy.',
    author: 'vaab-lang',
    licence: 'MIT',
    repo: 'https://github.com/vaab-lang/tape',
    needs: 'vaab at 0.1',
    tags: ['http', 'static', 'server'],
    seedDownloads: 0,
  },
]

export function getRiff(name: string): RiffPackage | undefined {
  return RIFF_CATALOG.find((pkg) => pkg.name === name)
}
