#!/usr/bin/env sh
# Runs one k6 scenario in Docker; saves a JSON summary + HTML report under results/.
#   ./run.sh 01_smoke
#   BASE_URL=http://host.docker.internal:8081 ./run.sh 01_smoke     # local dev
#   STEP=1m ./run.sh 04_read_mix
#   EXTRA_ENV="-e SOAK_VUS=200 -e SOAK_DURATION=30m" ./run.sh 12_soak
# Run from YOUR machine, not the VPS. Live dashboard: http://localhost:5665. Ctrl+C stops it.
set -eu
SCENARIO="${1:?usage: ./run.sh <scenario e.g. 01_smoke>}"
BASE_URL="${BASE_URL:-https://api.collzap.com}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
[ -f "$ROOT/scenarios/$SCENARIO.js" ] || { echo "No such scenario: $SCENARIO"; exit 1; }
mkdir -p "$ROOT/results"
NAME="$SCENARIO-$(date +%Y%m%d-%H%M%S)"
STEP_ARG=""; [ -n "${STEP:-}" ] && STEP_ARG="-e STEP=$STEP"
case "$BASE_URL" in *collzap.com*) echo "This is PRODUCTION. Real users can be affected. Ctrl+C to stop.";; esac
# shellcheck disable=SC2086
docker run --rm -i -v "$ROOT:/loadtest" -w /loadtest -p 5665:5665 \
  -e K6_WEB_DASHBOARD=true -e "K6_WEB_DASHBOARD_EXPORT=results/$NAME.html" \
  -e "BASE_URL=$BASE_URL" $STEP_ARG ${EXTRA_ENV:-} \
  grafana/k6 run --summary-export "results/$NAME.json" "scenarios/$SCENARIO.js"
