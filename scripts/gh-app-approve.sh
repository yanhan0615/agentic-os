#!/usr/bin/env bash
# gh-app-approve.sh - Approve and/or merge a PR using mozhuao[bot] identity
#
# Usage:
#   ./scripts/gh-app-approve.sh <pr_number>           # approve only
#   ./scripts/gh-app-approve.sh <pr_number> --merge   # approve + merge
#
# Config (hardcoded, override via env):
#   GH_APP_ID, GH_INSTALLATION_ID, GH_APP_PEM

set -euo pipefail

PR_NUMBER="${1:?Usage: $0 <pr_number> [--merge]}"
DO_MERGE="${2:-}"
REPO="yanhan0615/agentic-os"
APP_ID="${GH_APP_ID:-3214980}"
INSTALLATION_ID="${GH_INSTALLATION_ID:-119814745}"
PEM="${GH_APP_PEM:-/home/azureuser/.openclaw/workspace/secrets/gh-app-reviewer.pem}"

# 1. Generate JWT
NOW=$(date +%s); IAT=$((NOW-60)); EXP=$((NOW+540))
HEADER=$(echo -n '{"alg":"RS256","typ":"JWT"}' | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n')
PAYLOAD=$(echo -n "{\"iat\":$IAT,\"exp\":$EXP,\"iss\":$APP_ID}" | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n')
SIG=$(echo -n "$HEADER.$PAYLOAD" | openssl dgst -sha256 -sign "$PEM" | openssl base64 -e | tr -d '=' | tr '/+' '_-' | tr -d '\n')
JWT="$HEADER.$PAYLOAD.$SIG"

# 2. Get installation access token
TOKEN=$(curl -s -X POST \
  -H "Authorization: Bearer $JWT" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/app/installations/$INSTALLATION_ID/access_tokens" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# 3. Approve PR
RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$REPO/pulls/$PR_NUMBER/reviews" \
  -d '{"event":"APPROVE","body":"✅ Approved by mozhuao[bot] on behalf of arch review sign-off."}')

STATE=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('state','ERROR'))")
if [ "$STATE" = "APPROVED" ]; then
  echo "✅ PR #$PR_NUMBER approved"
else
  echo "❌ Approve failed: $STATE"
  echo "$RESPONSE" | python3 -m json.tool
  exit 1
fi

# 4. Merge if requested
if [ "$DO_MERGE" = "--merge" ]; then
  MERGE_RESP=$(curl -s -X PUT \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$REPO/pulls/$PR_NUMBER/merge" \
    -d '{"merge_method":"merge"}')

  MERGED=$(echo "$MERGE_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('merged', False))")
  if [ "$MERGED" = "True" ]; then
    SHA=$(echo "$MERGE_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])")
    echo "✅ PR #$PR_NUMBER merged ($SHA)"
  else
    echo "❌ Merge failed"
    echo "$MERGE_RESP" | python3 -m json.tool
    exit 1
  fi
fi
