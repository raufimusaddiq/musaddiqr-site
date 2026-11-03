#!/bin/sh
# Re-stamp the two asset references in site/index.html with a short content hash.
# Cloudflare caches /assets/* for 4h while the HTML is dynamic, so the ?v= in the
# HTML is the only thing that makes an edited stylesheet or script reach a reader
# immediately. Run after any change to site/assets/style.css or site/assets/app.js.
#
# Usage: scripts/stamp-assets.sh [repo-root]
#   With no argument the repo root is resolved from this script's own location,
#   so it works from any working directory.
set -eu

root=${1:-$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)}
index="$root/site/index.html"

[ -f "$index" ] || { echo "stamp-assets: no index.html at $index" >&2; exit 1; }
[ -f "$root/site/assets/style.css" ] || { echo "stamp-assets: no site/assets/style.css under $root" >&2; exit 1; }
[ -f "$root/site/assets/app.js" ] || { echo "stamp-assets: no site/assets/app.js under $root" >&2; exit 1; }

css=$(sha256sum "$root/site/assets/style.css" | cut -c1-10)
js=$(sha256sum "$root/site/assets/app.js" | cut -c1-10)

# Both references must be present; stamping half the page is worse than failing.
grep -q 'assets/style\.css' "$index" || { echo "stamp-assets: $index has no assets/style.css reference" >&2; exit 1; }
grep -q 'assets/app\.js' "$index" || { echo "stamp-assets: $index has no assets/app.js reference" >&2; exit 1; }

# The existing ?v= is replaced, never appended, so a second run is a no-op.
sed -i \
  -e "s|assets/style\.css\(\?v=[0-9a-f]*\)\{0,1\}|assets/style.css?v=$css|g" \
  -e "s|assets/app\.js\(\?v=[0-9a-f]*\)\{0,1\}|assets/app.js?v=$js|g" \
  "$index"

printf 'style.css?v=%s\napp.js?v=%s\n' "$css" "$js"
