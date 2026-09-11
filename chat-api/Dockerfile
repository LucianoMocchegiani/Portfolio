# Imagen portable de chat-api (otra plataforma = otro Compose + env).
FROM node:24-alpine AS build

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npx prisma generate && npx tsc

FROM node:24-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev \
  && npm install prisma@6.19.3 \
  && npx prisma generate
COPY --from=build /app/dist ./dist

EXPOSE 3020

CMD ["sh", "-c", "node dist/ensure-db.js && npx prisma migrate deploy && exec node dist/index.js"]
