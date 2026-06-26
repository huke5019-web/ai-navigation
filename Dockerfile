FROM public.ecr.aws/docker/library/node:22-alpine AS dependencies

WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
RUN npm ci

FROM public.ecr.aws/docker/library/node:22-alpine AS builder

WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL=file:./data/build.db
RUN mkdir -p prisma/data \
    && touch prisma/data/build.db \
    && ./node_modules/.bin/prisma migrate deploy \
    && npm run build

FROM public.ecr.aws/docker/library/node:22-alpine AS runner

WORKDIR /app
RUN apk add --no-cache libc6-compat openssl \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder --chown=nextjs:nodejs /app/package.json /app/package-lock.json ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/standalone/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib
COPY --chown=nextjs:nodejs docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN mkdir -p /app/prisma/data \
    && chown -R nextjs:nodejs /app \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs

EXPOSE 3000
VOLUME ["/app/prisma/data"]

ENTRYPOINT ["docker-entrypoint.sh"]
