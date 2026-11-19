#!/bin/sh
# Render scripts/og/og.html to site/assets/og.png at 1200x630 with headless Chrome.
# Usage: scripts/og/render.sh [path-to-chrome]
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
root=$(CDPATH= cd -- "$here/../.." && pwd)
chrome=${1:-${CHROME:-}}
if [ -z "$chrome" ]; then
  for c in "/c/Program Files/Google/Chrome/Application/chrome.exe" google-chrome chromium chromium-browser; do
    if command -v "$c" >/dev/null 2>&1 || [ -x "$c" ]; then chrome=$c; break; fi
  done
fi
[ -n "$chrome" ] || { echo "og: no Chrome found; pass its path" >&2; exit 1; }

src="$here/og.html"
out="$root/site/assets/og.png"
case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) src=$(cygpath -m "$src"); out=$(cygpath -w "$out");; esac

"$chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --virtual-time-budget=2000 --screenshot="$out" "file:///$src" >/dev/null 2>&1
echo "og: wrote site/assets/og.png"
