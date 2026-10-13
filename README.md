# site

The Vaab **site** — landing page, todo demo, riff registry, and browser playground for [Vaab](https://github.com/vaab-lang/vaab).

| Domain | App | Entry |
| --- | --- | --- |
| [vaab.dev](https://vaab.dev) | Landing + playground + todo demo (`/tasks`) | `main.vaab` |
| [riff.vaab.dev](https://riff.vaab.dev) | Package registry (**rig** + Postgres) | `main-riff.vaab` |

## Quick start

Requires Vaab **≥ 0.1.4** with live Postgres support (see the main [vaab](https://github.com/vaab-lang/vaab) repo).

```sh
cd web && npm install && npm run build && cd ..
vaab gather
RIG_DATABASE_URL=sqlite:riff-rig.db vaab serve main-riff.vaab
# → http://127.0.0.1:8787
```

## Riff registry (rig + Postgres)

The registry at **riff.vaab.dev** is a Vaab app that `need`s **[rig](./vendor/rig/)**:

- **`riffs` table** — catalog metadata (seeded on first connect)
- **`riff_events` table** — install/copy events for download counts and charts
- **API** — `GET /api/riffs`, `GET /api/riffs/{name}`, `GET /api/riffs/{name}/history`, `POST /api/riffs/{name}/track`

On Render, `render.yaml` provisions a free Postgres database and sets `RIG_DATABASE_URL` on the `riff` web service.

## Docker

The image builds Vaab from source (Postgres-enabled) and runs `vaab gather` for `need rig`.

```sh
docker build --platform linux/amd64 -t site .
docker run --rm -p 8787:8787 -e APP=riff -e RIG_DATABASE_URL=sqlite:riff-rig.db site
```

## Render

[`render.yaml`](./render.yaml): `site` + `riff` web services, `riff-db` Postgres.

MIT — same as Vaab.
