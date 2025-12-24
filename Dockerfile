# Estágio de Build
FROM node:20-bookworm AS builder

WORKDIR /app

# Instala dependências primeiro (otimiza cache do Docker)
COPY package*.json ./
RUN npm install

# Copia o código e compila
COPY . .
RUN npm run build

# Estágio Final (Imagem de Produção)
FROM mcr.microsoft.com/playwright:v1.49.0-jammy

WORKDIR /app

# Copia as dependências e o código compilado do estágio anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# O Playwright precisa de certas permissões e variáveis de ambiente
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV NODE_ENV=production

# Como é um servidor MCP via STDIO, não precisamos de EXPOSE.
# O comando padrão inicia o servidor.
CMD ["node", "dist/index.js"]