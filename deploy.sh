#!/usr/bin/env sh

# abort on errors
set -e

# # get remote url
REMOTE=$(git remote get-url origin)

# # navigate into the build output directory
cd dist

# Get git status
status=$(git status --porcelain)

# Check if there are any changes
if [ -n "$status" ]; then
  git add -A
  git commit -m "v01.$(date +%Y%m%d)" --no-verify
fi

git push ${REMOTE} dist:$1
