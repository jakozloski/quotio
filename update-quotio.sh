#!/bin/bash
# Auto-updates Quotio from source with custom changes.
# Fetches upstream, merges customizations, builds, and installs.
# Designed to run via launchd on a daily schedule.

set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$HOME/.quotio-update.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"; }

cd "$REPO_DIR"

log "Checking for upstream updates..."

git fetch origin >> "$LOG_FILE" 2>&1

LOCAL=$(git rev-parse HEAD)
UPSTREAM=$(git rev-parse origin/master)
MERGE_BASE=$(git merge-base HEAD origin/master)

if [ "$UPSTREAM" = "$MERGE_BASE" ] || [ "$UPSTREAM" = "$LOCAL" ]; then
    log "Already up to date. No rebuild needed."
    exit 0
fi

log "New upstream changes detected. Merging..."

if ! git merge origin/master --no-edit >> "$LOG_FILE" 2>&1; then
    log "ERROR: Merge conflict. Manual resolution needed in $REPO_DIR"
    osascript -e 'display notification "Merge conflict — run update-quotio.sh manually" with title "Quotio Update"'
    exit 1
fi

log "Building Release..."
if ! xcodebuild -scheme Quotio -configuration Release build -quiet >> "$LOG_FILE" 2>&1; then
    log "ERROR: Build failed. Check $LOG_FILE for details."
    osascript -e 'display notification "Build failed — check ~/.quotio-update.log" with title "Quotio Update"'
    exit 1
fi

log "Installing to /Applications..."
pkill -f "Quotio.app" 2>/dev/null || true
sleep 2

BUILD_DIR=$(find ~/Library/Developer/Xcode/DerivedData -name "Quotio-*" -type d -maxdepth 1 | head -1)
rm -rf /Applications/Quotio.app
cp -R "$BUILD_DIR/Build/Products/Release/Quotio.app" /Applications/Quotio.app

log "Relaunching Quotio..."
open /Applications/Quotio.app

log "Update complete."
osascript -e 'display notification "Updated and relaunched successfully" with title "Quotio Update"'
