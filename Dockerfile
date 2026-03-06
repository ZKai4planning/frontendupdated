# ---------------------------------------------------
# Stage 1 — Base Image
# ---------------------------------------------------
FROM node:22-alpine AS base

WORKDIR /app

RUN apk add --no-cache libc6-compat


# ---------------------------------------------------
# Stage 2 — Dependencies
# ---------------------------------------------------
FROM base AS deps

COPY package.json package-lock.json* ./

RUN npm ci


# ---------------------------------------------------
# Stage 3 — Builder
# ---------------------------------------------------
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build


# ---------------------------------------------------
# Stage 4 — Production Runner
# ---------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# install dumb-init for signal handling
RUN apk add --no-cache dumb-init

# create non-root user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# copy standalone output
COPY --from=builder /app/.next/standalone ./

# copy static files
COPY --from=builder /app/.next/static ./.next/static

# copy public folder
COPY --from=builder /app/public ./public

RUN chown -R nextjs:nextjs /app

USER nextjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "server.js"]