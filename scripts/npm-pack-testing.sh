#!/usr/bin/env bash
set -e

VERSION=$(npx pkg-jq -r .version)

if npx --package @chatie/semver semver-is-prod "$VERSION"; then
  NPM_TAG=latest
else
  NPM_TAG=next
fi

npm run dist
npm run pack

TMPDIR="/tmp/npm-pack-testing.$$"
mkdir "$TMPDIR"
mv ./*-*.*.*.tgz "$TMPDIR"
cp tests/fixtures/smoke-testing.ts "$TMPDIR"

cd $TMPDIR
npm init -y
npm install ./*-*.*.*.tgz \
  @chatie/tsconfig \
  @types/quick-lru \
  @types/lru-cache \
  @types/normalize-package-data \
  \
  lru-cache \
  file-box \
  memory-card \
  "wechaty-puppet@$NPM_TAG" \

./node_modules/.bin/tsc \
  --esModuleInterop \
  --lib esnext \
  --noEmitOnError \
  --noImplicitAny \
  --target es6 \
  --module commonjs \
  smoke-testing.ts

node smoke-testing.js
