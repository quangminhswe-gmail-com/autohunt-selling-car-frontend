FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM base AS development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS builder
COPY . .
ARG NEXT_PUBLIC_API_URL_PROD
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL_PROD
RUN npm run build
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

RUN npm prune --production

EXPOSE 3000
CMD ["npm", "start"]
