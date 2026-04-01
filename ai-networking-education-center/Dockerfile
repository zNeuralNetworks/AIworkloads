# Multi-stage build optimized for Cloud Run
FROM node:22-alpine AS deps
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

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

# Copy built assets from build stage
COPY --from=build /app/dist ./dist

# Copy package.json for versioning
COPY package.json .

# Cloud Run injects PORT; default to 8080
ENV PORT=8080

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Serve the app using native Node.js
CMD ["node", "-e", "require('http').createServer((req,res)=>{ if(req.url==='/health'){res.writeHead(200);res.end('OK')}else{const fs=require('fs');const path=require('path');const file=path.join('./dist',req.url==='/'?'index.html':req.url);try{res.writeHead(200,{'Content-Type':'text/html'});res.end(fs.readFileSync(file))}catch{res.writeHead(404);res.end('Not found')}} }).listen(process.env.PORT||8080)"]
