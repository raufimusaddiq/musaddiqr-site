# musaddiqr-site

The static portfolio at `musaddiqr.com`: one HTML page, one stylesheet, one small
script that fetches the stat strip, two self-hosted fonts, and two rendered motion
pieces. No build step, no framework, no bundler. Design direction lives in
[DESIGN.md](DESIGN.md).

Served by its own `caddy:2-alpine` container running `file_server`.

## Layout

```
site/index.html              the whole page
site/assets/style.css        the whole stylesheet
site/assets/app.js          the only script: fetches /assets/stats.json
site/assets/stats.json       snapshot refreshed on the host by collect-stats.sh
site/assets/fonts/*.woff2    Space Grotesk (300–700) + JetBrains Mono (400–700)
scripts/collect-stats.sh     the generator for stats.json
compose.yml                  the one service, on idx_default
motion/src/                  two Remotion compositions
motion/out/                  projects.mp4, agents.mp4 and their posters
```

## Serving

```sh
docker compose -p musaddiqr-site up -d
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8280/
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8280/assets/stats.json
```

The container is named `musaddiqr-site`, joins the external network `idx_default`,
restarts `unless-stopped`, and publishes `127.0.0.1:8280` only: it is not exposed
publicly by the container itself. `motion/out` is mounted at `site/assets/motion`,
so the videos are not duplicated into `site/`.

### Deploy order: hard rule

1. Container up and answering **200 locally** on `/` and `/assets/stats.json`.
2. Only then does the ops side install the Caddy block for `musaddiqr.com` and
   `www.musaddiqr.com`, validate, and reload.
3. Re-verify every other hostname against the ops baseline and compare.

Installing the Caddy block first means Caddy issues a certificate for a site whose
upstream does not exist yet, so the domain serves and immediately answers `502`,
worse than the current `525`, and a failed issuance costs a rate-limited retry.

## stats.json

Every number on the page comes from `GET /assets/stats.json`, served by this same
container, or the card is **absent**: never zero, never a hardcoded fallback.

```sh
BASELINE=/path/on/the/host/baseline-hosts-YYYYMMDD.txt scripts/collect-stats.sh
```

- The script reads each figure from a real command: `docker ps` filtered to
  `idx_default` for services running, `/proc/uptime` for host uptime, and a `curl`
  status comparison against the ops baseline file for hostnames answering.
- It refuses to write on a partial read: a failed `docker ps`, an unparseable
  `/proc/uptime`, a malformed baseline line, or a network where nothing answered
  aborts the run. The file is written to a temp file in the same directory, JSON-
  validated, then moved into place.
- Only counts are written. The baseline's hostnames, container names and paths stay
  out of `stats.json`, because that file is public. The baseline file must live
  outside this repository; the script refuses to run if it points inside.
- The page shows the snapshot's `generated_at` and its age, and withholds every
  card whose `generated_at` is older than `max_age_hours` (default 24). The label
  says "snapshot", not "live", so a stale file cannot make the copy false.
- To refresh it, run the command above on the host; it writes `site/assets/stats.json`.

Permitted figures: services running, host uptime, hostnames answering at baseline.
Nothing else is displayed: no commit count, no uptime percentage, no agent count.

The strip renders the three figures sourced today. A fourth figure also needs a
matching entry in the `CARDS` list in `site/assets/app.js`; adding a key to
`stats.json` alone does not render it.

## Motion

```sh
cd motion
npm install
npm run render     # writes out/projects.mp4, out/agents.mp4 and both posters
```

Two 26-second compositions at 1920×1080, 30fps: `projects` (the eight public
repositories) and `agents` (the six mechanisms). Both embed their bundled woff2
through `FontFace` before the first frame. Space Grotesk is not installed on the
render host, and without it the page renders DejaVu and every rounded card looks
wrong. Scene durations live in one list at the top of `motion/src/Root.tsx`.

## Fonts

Self-hosted woff2 under `site/assets/fonts/`, declared with `font-display: swap`.
Nothing on the page requests a font from Google at runtime.

## Honesty rules that constrain the page

- No figure that is not read from a command's output.
- No agent activity log, timeline, or dated event, anywhere on the page, in either
  video, or in a poster.
- No private repository name, private URL, or private hostname in this repository,
  the page, the videos, or commit messages. Private work appears only as a title, a
  sentence and a stack line, with no name and no link.
