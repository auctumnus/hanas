# wip
### Base ###
FROM node:16-alpine3.11 AS base

RUN npm --no-update-notifier --no-fund --global install pnpm

WORKDIR /app

### Dependencies ###
FROM base AS deps

# this should include everything we need to copy over
COPY package.json .
COPY pnpm-lock.yaml .
COPY packages/api/package.json .

RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
 PRISMA_SKIP_POSTINSTALL_GENERATE=true \
 pnpm install --frozen-lockfile

### 

