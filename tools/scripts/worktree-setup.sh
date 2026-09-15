#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 <branch-name> [worktree-path]"
  echo ""
  echo "Creates a git worktree for the ai-toolkit monorepo and sets it up."
  echo ""
  echo "Arguments:"
  echo "  branch-name       Git branch to check out in the worktree"
  echo "  worktree-path     Path for the new worktree (default: ../<branch-name>)"
  exit 1
}

if [ $# -lt 1 ]; then
  usage
fi

BRANCH="$1"
WORKTREE_PATH="${2:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -z "$WORKTREE_PATH" ]; then
  WORKTREE_PATH="$(dirname "$ROOT")/$BRANCH"
fi

echo "Worktree Setup"
echo "==============="
echo "Branch:     $BRANCH"
echo "Worktree:   $WORKTREE_PATH"
echo "Root:       $ROOT"
echo ""

command -v git >/dev/null 2>&1 || { echo "Error: git is not installed"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "Error: pnpm is not installed"; exit 1; }

if [ "$(git -C "$ROOT" rev-parse --is-inside-work-tree 2>/dev/null)" != "true" ]; then
  echo "Error: $ROOT is not a git work tree"
  exit 1
fi

if git -C "$ROOT" worktree list --porcelain | grep -q "worktree $WORKTREE_PATH"; then
  echo "Worktree already exists at $WORKTREE_PATH"
  echo "Removing existing worktree..."
  git -C "$ROOT" worktree remove --force "$WORKTREE_PATH"
fi

if ! git -C "$ROOT" show-ref --verify --quiet "refs/heads/$BRANCH"; then
  echo "Branch '$BRANCH' does not exist locally."
  echo "Fetching from remote..."
  git -C "$ROOT" fetch origin "$BRANCH" || {
    echo "Error: could not fetch branch '$BRANCH' from origin"
    exit 1
  }
fi

echo "Creating worktree..."
git -C "$ROOT" worktree add "$WORKTREE_PATH" "$BRANCH"

echo ""
echo "Installing dependencies..."
cd "$WORKTREE_PATH"
pnpm install

echo ""
echo "Worktree setup complete!"
echo "  Path: $WORKTREE_PATH"
echo "  Branch: $BRANCH"
echo ""
echo "To remove this worktree later:"
echo "  git -C \"$ROOT\" worktree remove --force \"$WORKTREE_PATH\""
