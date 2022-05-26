FROM node:16-alpine3.15 AS base

RUN npm --no-update-notifier --no-fund --global install prisma

WORKDIR /a

COPY ./packages/api/prisma/schema.prisma ./

CMD [ "prisma", "db", "push" ]