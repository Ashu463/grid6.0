# ─────────────────────────────────────────────
# Stage 1: Builder
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y openssl

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build


# ─────────────────────────────────────────────
# Stage 2: Runner
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y openssl libssl3 && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# 🔥 CRITICAL FIX
RUN npx prisma generate

EXPOSE 9000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]