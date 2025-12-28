# Build
FROM node:20-bookworm AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy code and compile
COPY . .
RUN npm run build

# Build Image
FROM mcr.microsoft.com/playwright:v1.49.0-jammy

WORKDIR /app

# Copy depencies and code
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV NODE_ENV=production

# Start server
CMD ["node", "dist/index.js"]