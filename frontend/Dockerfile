# 1단계: Builder
FROM node:20-slim AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY .npmrc .npmrc
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile
# 소스 복사
COPY . .

# Next.js 빌드
RUN pnpm run build

# 2단계: Runtime
FROM node:20-slim AS runtime

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["npm", "start"]
