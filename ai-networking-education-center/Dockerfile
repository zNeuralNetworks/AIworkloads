# Build stage
FROM node:22-alpine AS build
WORKDIR /app

# Install all dependencies (for build)
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy source and build
COPY . .
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
