# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Development stage
FROM node:20-alpine AS development

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/drizzle.config.js ./
COPY --from=builder /app/eslint.config.js ./

EXPOSE 3000
CMD ["npm", "start"]
