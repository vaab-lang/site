# site

The Vaab **site** — landing page, todo demo, riff registry, and browser playground for [Vaab](https://github.com/vaab-lang/vaab).

One Vaab process serves each app: static files, `/health`, and app-specific APIs.

| Domain | App | Entry |
| --- | --- | --- |
| [vaab.dev](https://vaab.dev) | Landing + playground + todo demo (`/tasks`) | `main.vaab` |
| [riff.vaab.dev](https://riff.vaab.dev) | Package registry | `main-riff.vaab` |

## Quick start

Requires a local [Vaab](https://github.com/vaab-lang/vaab) build (≥ 0.1.3).

```sh
cd web && npm install && npm run build && cd ..
vaab serve main.vaab
# → http://127.0.0.1:8787
```

Other apps locally:

```sh
vaab serve main-riff.vaab   # riff registry API + UI
```

The todo demo runs inside the site service (`/tasks` + `/api/todos`).

Or set `VITE_APP_MODE=todo|riff|site` when running the Vite dev server to preview a subdomain UI on localhost.

## What's inside

| Path | Purpose |
| --- | --- |
| `main.vaab` | Site — static files, health, playground, todo demo API |
| `main-riff.vaab` | Riff registry — `/api/riffs` download stats |
| `web/` | React + Vite frontend (shared build, hostname + path routing) |
| `render.yaml` | Two Render web services from one Dockerfile |

## Architecture

```
vaab.dev (APP=site)
   ├─ GET /*           → reply file web/dist/...
   ├─ GET /health      → Vaab JSON route
   ├─ POST /api/run    → vaab-server playground
   └─ /api/todos/…     → Store-backed todos at /tasks (per visitor cookie)

riff.vaab.dev (APP=riff)
   ├─ GET /            → riff registry UI
   ├─ GET /api/riffs   → live install counts (rig + SQLite)
   └─ POST /api/riffs/{name}/track → record install/copy via rig
```

Install/download telemetry is stored by the **[rig](https://github.com/vaab-lang/rig)** riff
(`riff_events` table). The UI and `riff install` both hit `/track`.

## Docker

```sh
docker build --platform linux/amd64 -t site .
docker run --rm -p 8787:8787 -e PORT=8787 -e APP=site site
docker run --rm -p 8789:8789 -e PORT=8789 -e APP=riff site
```

## Free hosting (Render)

[`render.yaml`](./render.yaml) deploys two Docker web services on Render’s free plan (two custom domains). Set custom domains in the Render dashboard:

- `site` → `vaab.dev`
- `riff` → `riff.vaab.dev`

Private deploy repos:

- https://github.com/ryanza/pitch-host
- https://github.com/vaab-lang/site-host

## License

MIT — same as Vaab.
