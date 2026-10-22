#!/usr/bin/env bash
# Gate self-test (ADR-751 in cogniawerks-api): gitleaks must fail on a repository with a committed fake secret.
# Usage: selftest-secret.sh WORK_DIR   (WORK_DIR must not exist; it is created outside this repository's history)
# The key is random and generated at run time, so no secret-shaped string is stored in this repository.
set -euo pipefail

repo="${1:?usage: selftest-secret.sh WORK_DIR}"
if [ -e "$repo" ]; then
  echo "$repo already exists" >&2
  exit 2
fi
git init -q "$repo"
# Read a fixed amount of random data first: `tr < /dev/urandom | head` ends with SIGPIPE under pipefail.
raw=""
while [ "${#raw}" -lt 16 ]; do
  raw="$raw$(head -c 512 /dev/urandom | LC_ALL=C tr -dc 'A-Z2-7')"
done
key="AKIA${raw:0:16}"
printf 'aws_access_key_id = %s\n' "$key" > "$repo/settings.ini"
git -C "$repo" add settings.ini
git -C "$repo" -c user.name=selftest -c user.email=selftest@example.invalid -c commit.gpgsign=false commit -qm canary

# Fail closed: the scan must exit 1 *and* report the planted key (a missing or broken scanner also exits non-zero).
status=0
gitleaks git --redact --no-banner --exit-code 1 --report-format json --report-path "$repo.report.json" "$repo" || status=$?
if [ "$status" -ne 1 ] || ! grep -q '"RuleID": *"aws-access-token"' "$repo.report.json" 2>/dev/null; then
  echo "::error::gitleaks did not detect the committed fake secret (exit $status)"
  exit 1
fi
echo "gitleaks failed on the committed fake secret, as expected."
