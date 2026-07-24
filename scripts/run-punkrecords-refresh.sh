#!/bin/zsh
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export PUNK_RECORDS_ROOT="${PUNK_RECORDS_ROOT:-/Users/shika/.openclaw/workspace/PunkRecords}"

cd /Users/shika/business-agents/dashboard
mkdir -p logs

npm run refresh:punkrecords:deploy
