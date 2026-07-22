# Build stage
FROM node:22-alpine AS build
WORKDIR /app

# Install all dependencies (for build)
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy source and build
COPY . .

# Vite inlines VITE_* at build time — Coolify runtime env can't reach the bundle,
# so publishable client values are baked as ARG defaults (overridable via build args
# or Coolify app envs, which this Coolify feeds into Dockerfile builds).
# The Supabase key is a publishable/anon key (RLS-protected, browser-safe).
ARG VITE_SUPABASE_URL=https://puktrjfoazyydypagvyj.supabase.co
ARG VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_gBEp_3g8ZjgxJXI_BgjkWA_i8RlNUrW
ARG VITE_GCP_PROJECT_ID=
ARG VITE_GCP_STORAGE_BUCKET=
ARG VITE_SENTRY_DSN=
# Commit stamp for dist/version.json — Coolify strips .git from the build context,
# so the SHA arrives via app env (set by the CI deploy job before triggering).
ARG SOURCE_COMMIT=
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=$VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY \
    VITE_GCP_PROJECT_ID=$VITE_GCP_PROJECT_ID \
    VITE_GCP_STORAGE_BUCKET=$VITE_GCP_STORAGE_BUCKET \
    VITE_SENTRY_DSN=$VITE_SENTRY_DSN \
    SOURCE_COMMIT=$SOURCE_COMMIT
RUN npm run build

# Runtime stage
FROM node:22-alpine AS runtime
WORKDIR /app

# Install tini for proper signal handling
RUN apk add --no-cache tini

# Set production environment
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY server.cjs ./server.cjs

ENV PORT=8080

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "server.cjs"]
