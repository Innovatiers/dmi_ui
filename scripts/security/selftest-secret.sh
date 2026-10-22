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
key="AKIA$(LC_ALL=C tr -dc 'A-Z2-7' < /dev/urandom | head -c 16)"
printf 'aws_access_key_id = %s\n' "$key" > "$repo/settings.ini"
git -C "$repo" add settings.ini
git -C "$repo" -c user.name=selftest -c user.email=selftest@example.invalid -c commit.gpgsign=false commit -qm canary

if gitleaks git --redact --no-banner --exit-code 1 "$repo"; then
  echo "::error::gitleaks did not detect the committed fake secret"
  exit 1
fi
echo "gitleaks failed on the committed fake secret, as expected."
