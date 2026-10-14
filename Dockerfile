# site — Vaab landing page + riff registry (rig + Postgres on Render)
#
# Build:  docker build --platform linux/amd64 -t site .
# Run:    docker run --rm -p 8787:8787 -e PORT=8787 -e APP=riff \
#           -e RIG_DATABASE_URL=sqlite:riff-rig.db site

# ── Vaab toolchain (Postgres-enabled) ─────────────────────────────────
# Needs Rust ≥ 1.88 (transitive deps). `-j 1` keeps Render/free Docker builds
# under memory limits while compiling cranelift/postgres.
FROM rust:1.88-bookworm AS vaab-build
ENV CARGO_BUILD_JOBS=1 \
    CARGO_INCREMENTAL=0
RUN apt-get update \
    && apt-get install -y --no-install-recommends pkg-config libssl-dev git \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /src
ARG VAAB_REPO=https://github.com/vaab-lang/vaab.git
ARG VAAB_REF=master
ARG VAAB_COMMIT=4226194
RUN git clone --depth 1 --branch "${VAAB_REF}" "${VAAB_REPO}" vaab \
    && cd vaab \
    && cargo build --release -p vaab-cli --bin vaab -j 1 \
    && cp target/release/vaab /usr/local/bin/vaab

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
    && apt-get install -y --no-install-recommends ca-certificates libssl3 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=vaab-build /usr/local/bin/vaab /usr/local/bin/vaab

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
RUN vaab gather

EXPOSE 8787
ENTRYPOINT ["/home/site/docker-entrypoint.sh"]
