FROM node:20-slim

WORKDIR /app

# Copy package files
COPY server/package.json server/package-lock.json ./server/
COPY client/package.json client/package-lock.json ./client/

# Install dependencies
RUN cd server && npm ci --production
RUN cd client && npm ci

# Copy source code
COPY server/ ./server/
COPY client/ ./client/

# Build frontend
RUN cd client && npm run build

# Copy widget.js to the built dist folder
RUN cp client/public/widget.js client/dist/widget.js 2>/dev/null || true

# Expose port
ENV PORT=3001
ENV NODE_ENV=production
EXPOSE 3001

# Start server
WORKDIR /app/server
CMD ["node", "src/index.js"]
