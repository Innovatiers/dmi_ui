#!/usr/bin/env bash
# Gate self-test (ADR-034 in cogniawerks-api): the npm audit gate must fail on a package with a known Critical advisory
# (minimist 1.2.5, GHSA-xvch-5gv4-984h), pass when a valid exception covers it, and fail again when that exception has
# expired or runs longer than 90 days (DEC-43). Only a lock file is resolved in WORK_DIR; nothing is installed or run.
# The exception dates and the gate's --today are fixed, so the result does not depend on the clock.
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
today=2026-10-23
exception() {
  printf 'exceptions:\n  - id: GHSA-xvch-5gv4-984h\n    reason: gate self-test exception\n    start: %s\n    expires: %s\n' "$1" "$2"
}
exception 2026-10-01 2026-12-30 > "$work/valid.yaml"
exception 2026-07-01 2026-09-29 > "$work/expired.yaml"
exception 2026-10-01 2026-12-31 > "$work/too-long.yaml"

expect() {
  local expected="$1" file="$2" description="$3" actual=0
  node "$gate" --file "$work/$file" --today "$today" npm-gate "$work/audit.json" || actual=$?
  if [ "$actual" -ne "$expected" ]; then
    echo "::error::npm audit gate self-test: $description (exit $actual, expected $expected)"
    exit 1
  fi
  echo "OK: $description (exit $actual)"
}

expect 1 none.yaml "a Critical advisory without an exception fails the gate"
expect 0 valid.yaml "a valid exception lets the finding pass"
expect 1 expired.yaml "an expired exception fails the gate"
expect 1 too-long.yaml "an exception of 91 days fails the gate"
