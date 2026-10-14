import { GitBranch, Loader2, Plus } from 'lucide-react'
import { useState } from 'react'

import { registerRiffFromGithub } from '@/lib/github-riff'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type AddRiffDialogProps = {
  onAdded: () => void
}

export function AddRiffDialog({ onAdded }: AddRiffDialogProps) {
  const [open, setOpen] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await registerRiffFromGithub(repoUrl)
      setRepoUrl('')
      setOpen(false)
      onAdded()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add riff')
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <Button type="button" variant="default" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add riff
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        aria-label="Close"
        onClick={() => !busy && setOpen(false)}
      />
      <form
        onSubmit={(event) => void submit(event)}
        className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-emerald-950/30"
      >
        <h2 className="text-lg font-bold text-slate-50">Add a riff from GitHub</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Paste a public repo URL. We fetch <code className="text-emerald-400">riff</code> from{' '}
          <code className="text-slate-300">main</code> or <code className="text-slate-300">master</code>{' '}
          and register it in the catalog.
        </p>

        <label className="mt-5 block text-sm font-medium text-slate-300" htmlFor="github-repo">
          GitHub repository
        </label>
        <div className="relative mt-2">
          <GitBranch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            id="github-repo"
            value={repoUrl}
            onChange={(event) => setRepoUrl(event.target.value)}
            placeholder="https://github.com/vaab-lang/tape"
            className="pl-10"
            disabled={busy}
            autoFocus
          />
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={busy} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy || !repoUrl.trim()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add to catalog
          </Button>
        </div>
      </form>
    </div>
  )
}
