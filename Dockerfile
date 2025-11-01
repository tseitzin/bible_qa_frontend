# Frontend Dockerfile with dev and production targets
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies separately for caching
COPY package*.json ./
RUN npm install

COPY . .

# Development target
FROM base AS dev
EXPOSE 5173
CMD ["npm","run","dev","--","--host"]

# Production build
FROM base AS build
RUN npm run build

# Production serve image
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=build /app/dist ./dist
# Simple static file server using a tiny node script; fallback to Express if present
COPY server.js ./server.js
EXPOSE 8080
CMD ["node","server.js"]