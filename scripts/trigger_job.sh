#!/usr/bin/env bash
# Trigger the GitHub repository_dispatch event to create a job via the Actions workflow.
# Usage: echo '{"job":{...}}' | ./scripts/trigger_job.sh

set -euo pipefail

if [ -z "${GITHUB_PAT:-}" ]; then
  echo "Please set GITHUB_PAT environment variable with a Personal Access Token (repo scope)." >&2
  exit 1
fi

if [ -t 0 ]; then
  echo "Reading job JSON from stdin. Example: echo '{\"job\":{\"id\":123,\"title\":\"Test\"}}' | $0" >&2
  exit 1
fi

PAYLOAD=$(cat -)

OWNER="$(git config --get remote.origin.url | sed -n 's#.*[:/]\([^/]*\)/\([^/.]*\).*#\1#p')"
REPO="$(git config --get remote.origin.url | sed -n 's#.*[:/]\([^/]*\)/\([^/.]*\).*#\2#p')"

if [ -z "$OWNER" ] || [ -z "$REPO" ]; then
  echo "Could not determine owner/repo from git remote. Please run this inside the repository." >&2
  exit 1
fi

echo "Triggering repository_dispatch for $OWNER/$REPO..."

curl -s -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: token $GITHUB_PAT" \
  https://api.github.com/repos/$OWNER/$REPO/dispatches \
  -d "{\"event_type\":\"create_job\",\"client_payload\":$PAYLOAD}"

echo "\nDispatched. The workflow should run shortly (check Actions tab)."
