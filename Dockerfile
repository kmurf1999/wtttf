# forward env

# Install dependencies only when needed
FROM node:16-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app



# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM node:16-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .


ENV NODE_ENV production

ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG APP_URL
ARG WS_URL
ENV DATABASE_URL=$DATABASE_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID
ENV GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

RUN npm run build

# Production image, copy all the files and run next
FROM node:16-alpine AS runner
WORKDIR /app

# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

USER nextjs

ARG PORT
EXPOSE $PORT
ENV PORT=$PORT

# ARG DATABASE_URL
# ARG NEXTAUTH_SECRET
# ARG NEXTAUTH_URL
# ARG GITHUB_CLIENT_ID
# ARG GITHUB_CLIENT_SECRET
# ARG GOOGLE_CLIENT_ID
# ARG GOOGLE_CLIENT_SECRET
# ARG APP_URL
# ARG WS_URL
# ENV DATABASE_URL=$DATABASE_URL
# ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
# ENV NEXTAUTH_URL=$NEXTAUTH_URL
# ENV GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID
# ENV GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET
# ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
# ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
# ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
# ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

CMD ["npm", "run", "start"]
