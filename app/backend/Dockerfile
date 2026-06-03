# etap 1 - instalacja zależności produkcyjnych
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# instalacja tylko zależności produkcyjnych (bez devDependencies)
RUN npm ci --only=production

# etap 2 - finalny obraz produkcyjny
# kopia tylko tego co potrzebne - bez narzędzi deweloperskich
FROM node:20-alpine
WORKDIR /app

# kopiujemy zainstalowane paczki
COPY --from=deps /app/node_modules ./node_modules

# kopiujemy kod aplikacji
COPY src/ ./src/
COPY package.json ./

EXPOSE 8080

CMD ["node", "src/index.js"]
