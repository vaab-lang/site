# site — Vaab landing page + playground
#
# The HTTP server is Vaab itself (`vaab serve main.vaab`). No nginx/Caddy.
#
# Build:  docker build --platform linux/amd64 -t site .
# Run:    docker run --rm -p 8787:8787 -e PORT=8787 site

# ── frontend ──────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS web
WORKDIR /src/web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# ── runtime ───────────────────────────────────────────────────────────
FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

# Prebuilt Vaab CLI (linux x86_64). Readability round needs >=0.1.3.
ARG VAAB_VERSION=v0.1.3
RUN curl -fsSL \
      "https://github.com/vaab-lang/vaab/releases/download/${VAAB_VERSION}/vaab-linux-x86_64" \
      -o /usr/local/bin/vaab \
    && chmod +x /usr/local/bin/vaab \
    && vaab version | grep -q 0.1.3

RUN useradd --create-home --shell /bin/bash site
USER site
WORKDIR /home/site/app
ENV HOME=/home/site \
    PORT=8787

COPY --chown=site:site main.vaab main-riff.vaab riff ./
COPY --chown=site:site vendor ./vendor
COPY --from=web --chown=site:site /src/web/dist ./web/dist
COPY --chown=site:site docker-entrypoint.sh /home/site/docker-entrypoint.sh
RUN chmod +x /home/site/docker-entrypoint.sh
# Resolve `need rig from ./vendor/rig` for the registry app
RUN vaab gather

EXPOSE 8787
ENTRYPOINT ["/home/site/docker-entrypoint.sh"]
