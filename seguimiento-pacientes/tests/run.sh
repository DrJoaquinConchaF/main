#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export npm_config_cache=/workspace/.npm-cache
export XDG_CONFIG_HOME=/workspace/.config
export WRANGLER_SEND_METRICS=false
export CI=true
unset CLOUDFLARE_API_TOKEN
npm run build
state_dir=$(mktemp -d /tmp/clinical-tests.XXXXXX)
server_pid=''
cleanup(){ if [ -n "$server_pid" ]; then kill "$server_pid" 2>/dev/null || true; wait "$server_pid" 2>/dev/null || true; fi; rm -rf "$state_dir"; }
trap cleanup EXIT
node scripts/local-db.mjs --persist-to "$state_dir" > "$state_dir/db.log" 2>&1 || { cat "$state_dir/db.log"; exit 1; }
./node_modules/.bin/wrangler dev --local --ip 127.0.0.1 --port 8788 --var DEV_MODE:local --persist-to "$state_dir" > "$state_dir/server.log" 2>&1 &
server_pid=$!
for i in $(seq 1 40); do
 if curl --silent --fail http://127.0.0.1:8788/api/health >/dev/null; then break; fi
 if ! kill -0 "$server_pid" 2>/dev/null; then cat "$state_dir/server.log"; exit 1; fi
 sleep 1
done
curl --silent --fail http://127.0.0.1:8788/api/health >/dev/null || { cat "$state_dir/server.log"; exit 1; }
TEST_BASE_URL=http://127.0.0.1:8788 ./node_modules/.bin/tsx --test tests/*.test.mjs tests/*.test.ts
