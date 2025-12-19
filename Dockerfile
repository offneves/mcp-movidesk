FROM node:18-bookworm-slim

# Install dependencies for Playwright
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && npx playwright install-deps chromium \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build
# Or if build script is not defined in package.json, assume tsc
# RUN npx tsc

# Install playwright browsers
RUN npx playwright install chromium

EXPOSE 3000

CMD ["node", "dist/index.js"]
