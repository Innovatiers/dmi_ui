#!/usr/bin/env bash
# Gate self-test (ADR-751 in cogniawerks-api): the npm audit gate must fail on a package with a known Critical advisory
# (minimist 1.2.5, GHSA-xvch-5gv4-984h), pass when a valid exception covers it, and fail again when that exception has
# expired. Only a lock file is resolved in WORK_DIR; nothing is installed or run.
# Usage: selftest-npm.sh WORK_DIR   (run from the repository root; WORK_DIR must not exist)
set -euo pipefail

work="${1:?usage: selftest-npm.sh WORK_DIR}"
gate="$(pwd)/scripts/security/exceptions.mjs"
if [ -e "$work" ]; then
  echo "$work already exists" >&2
  exit 2
fi
mkdir -p "$work"
printf '{ "name": "audit-canary", "version": "1.0.0", "private": true, "dependencies": { "minimist": "1.2.5" } }\n' \
  > "$work/package.json"
(cd "$work" && npm install --package-lock-only --ignore-scripts --no-audit --no-fund --silent)
(cd "$work" && npm audit --package-lock-only --json > audit.json) || true

printf 'exceptions: []\n' > "$work/none.yaml"
printf 'exceptions:\n  - id: GHSA-xvch-5gv4-984h\n    reason: gate self-test exception\n    expires: 2999-12-31\n' > "$work/valid.yaml"
printf 'exceptions:\n  - id: GHSA-xvch-5gv4-984h\n    reason: gate self-test exception\n    expires: 2000-01-01\n' > "$work/expired.yaml"

expect() {
  local expected="$1" file="$2" description="$3" actual=0
  node "$gate" --file "$work/$file" npm-gate "$work/audit.json" || actual=$?
  if [ "$actual" -ne "$expected" ]; then
    echo "::error::npm audit gate self-test: $description (exit $actual, expected $expected)"
    exit 1
  fi
  echo "OK: $description (exit $actual)"
}

expect 1 none.yaml "a Critical advisory without an exception fails the gate"
expect 0 valid.yaml "a valid exception lets the finding pass"
expect 1 expired.yaml "an expired exception fails the gate"
