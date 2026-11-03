#!/usr/bin/env bash
# collect-stats.sh — produces site/assets/stats.json, the only source of numbers
# on the page. No figure here is typed by hand: each one is read from a command
# on the host. A partial read fails loudly and writes nothing.
#
#   BASELINE=/path/outside/repo/baseline-hosts-YYYYMMDD.txt \
#     scripts/collect-stats.sh [--out site/assets/stats.json] [--network idx_default]
#
# The baseline file lists "hostname status" per line (the ops-side baseline).
# Its hostnames stay out of the output and out of this repository: only counts
# are written, so stats.json is safe to publish.
set -euo pipefail

NETWORK="${NETWORK:-idx_default}"
OUT="${OUT:-site/assets/stats.json}"
MAX_AGE_HOURS="${MAX_AGE_HOURS:-24}"
BASELINE="${BASELINE:-}"

die() { printf 'collect-stats: %s\n' "$*" >&2; exit 1; }

while [ $# -gt 0 ]; do
  case "$1" in
    --out) [ $# -ge 2 ] || die "--out needs a value"; OUT="$2"; shift 2 ;;
    --network) [ $# -ge 2 ] || die "--network needs a value"; NETWORK="$2"; shift 2 ;;
    --baseline) [ $# -ge 2 ] || die "--baseline needs a value"; BASELINE="$2"; shift 2 ;;
    --max-age-hours) [ $# -ge 2 ] || die "--max-age-hours needs a value"; MAX_AGE_HOURS="$2"; shift 2 ;;
    -h|--help) sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) die "unknown argument: $1" ;;
  esac
done

command -v docker >/dev/null || die "docker not found"
command -v curl   >/dev/null || die "curl not found"
command -v python3 >/dev/null || die "python3 not found (used to validate the JSON)"

[ -n "$BASELINE" ] || die "BASELINE is unset — the hostname figure cannot be sourced without it"
[ -r "$BASELINE" ] || die "baseline file is not readable: $BASELINE"

# The baseline names private hosts. It must never sit inside this repository.
repo_root="$(cd "$(dirname "$0")/.." && pwd)"
base_real="$(cd "$(dirname "$BASELINE")" && pwd)/$(basename "$BASELINE")"
case "$base_real" in
  "$repo_root"/*) die "baseline file is inside the repository ($repo_root); keep it on the ops side" ;;
esac

# ---- services running on the network --------------------------------------
if ! docker network inspect "$NETWORK" >/dev/null 2>&1; then
  die "docker network $NETWORK not found"
fi

ids="$(docker ps --filter "network=$NETWORK" --format '{{.ID}}')" \
  || die "docker ps failed — refusing to write a partial file"
services="$(printf '%s' "$ids" | grep -c . || true)"
case "$services" in
  ''|*[!0-9]*) die "service count did not parse: '$services'" ;;
esac
[ "$services" -gt 0 ] || die "no running containers seen on $NETWORK — that is not a measurement, it is a broken read"

# ---- host uptime ----------------------------------------------------------
[ -r /proc/uptime ] || die "/proc/uptime is not readable"
read -r up_raw _ < /proc/uptime || die "/proc/uptime did not parse"
uptime_s="$(printf '%.0f' "$up_raw" 2>/dev/null)" || die "/proc/uptime did not parse"
case "$uptime_s" in
  ''|*[!0-9]*) die "host uptime did not parse: '$up_raw'" ;;
esac

# ---- hostnames answering at baseline --------------------------------------
checked_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
total=0; answering=0; transport_fail=0
while IFS=' ' read -r host want extra || [ -n "${host:-}" ]; do
  [ -z "${host:-}" ] && continue
  case "$host" in \#*) continue ;; esac
  [ -z "${extra:-}" ] || die "malformed baseline line: '$host $want $extra'"
  case "$want" in
    [0-9][0-9][0-9]) : ;;
    *) die "malformed baseline status for a host: '$want'" ;;
  esac
  case "$host" in
    *[!A-Za-z0-9.-]*) die "malformed hostname in baseline" ;;
  esac

  total=$((total + 1))
  got="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "https://$host" 2>/dev/null || true)"
  if [ -z "$got" ] || [ "$got" = "000" ]; then
    transport_fail=$((transport_fail + 1))
    printf 'collect-stats: no answer from a baseline host\n' >&2
    continue
  fi
  [ "$got" = "$want" ] && answering=$((answering + 1))
done < "$BASELINE"

[ "$total" -gt 0 ] || die "baseline file yielded no hostnames"
[ "$transport_fail" -lt "$total" ] || die "no baseline host answered at all — the network read is broken"

# ---- write atomically -----------------------------------------------------
out_dir="$(dirname "$OUT")"
mkdir -p "$out_dir"
tmp="$(mktemp "$out_dir/.stats.json.XXXXXX")"
trap 'rm -f "$tmp"' EXIT

cat > "$tmp" <<JSON
{
  "generated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "max_age_hours": $MAX_AGE_HOURS,
  "services_running": $services,
  "host_uptime_seconds": $uptime_s,
  "hostnames_answering": $answering,
  "hostnames_checked": $total,
  "hostnames_checked_at": "$checked_at"
}
JSON

python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); assert isinstance(d,dict) and d["generated_at"]' "$tmp" \
  || die "generated JSON did not validate"

mv -f "$tmp" "$OUT"
trap - EXIT
printf 'collect-stats: wrote %s (%s/%s hostnames answering, %s services)\n' \
  "$OUT" "$answering" "$total" "$services"
