FROM node:18-alpine AS base

FROM base AS deps

RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package.json pnpm-lock.yaml* .npmrc* ./

RUN corepack enable pnpm && pnpm i --frozen-lockfile

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

ENV NEXT_SERVER_ACTIONS_BODY_SIZE_LIMIT=250mb
ENV NEXT_OUTPUT=standalone

RUN corepack enable pnpm && pnpm run build; \
    echo "Verificando estructura de build:"; \
    ls -la /app/.next || echo "No se encontró .next"; \
    ls -la /app/.next/standalone || echo "No se encontró standalone"; \
    
    if [ -d public ]; then cp -r public /app/.next/standalone/public; fi

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]