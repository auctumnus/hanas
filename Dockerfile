# wip
### Base ###
FROM node:16-alpine3.15 AS base

RUN npm --no-update-notifier --no-fund --global install pnpm

WORKDIR /app

### Dependencies ###
FROM base AS deps

# this should include everything we need to copy over
COPY pnpm-lock.yaml ./
COPY packages/api/package.json packages/api/packages.json
COPY packages/backend-shared/package.json packages/backend-shared/package.json

RUN pnpm fetch --prod

COPY package.json pnpm-workspace.yaml ./
COPY packages/api packages/api
COPY packages/backend-shared packages/backend-shared

RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
  PRISMA_SKIP_POSTINSTALL_GENERATE=true \
  pnpm install --frozen-lockfile

### Build ###

COPY .env.defaults ./

WORKDIR /app/packages/api

RUN pnpm run prisma:generate

RUN pnpm run build

### Run
CMD [ "pnpm", "start" ]