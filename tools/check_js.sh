#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
for f in version.js storage.js data-safety.js diagnostics.js app.js extension-bridge.js pwa-register.js sw.js; do
  node --check "$f"
done
echo "JavaScript syntax: PASS"
