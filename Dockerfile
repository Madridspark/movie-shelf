FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_TMDB_ACCESS_TOKEN
ARG VITE_TMDB_BASE_URL=https://api.themoviedb.org/3

ENV VITE_TMDB_ACCESS_TOKEN=$VITE_TMDB_ACCESS_TOKEN
ENV VITE_TMDB_BASE_URL=$VITE_TMDB_BASE_URL

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/public/assets/brand /usr/share/nginx/html/assets/brand
COPY --from=builder /app/public/favicon.png /usr/share/nginx/html/favicon.png
COPY --from=builder /app/public/apple-touch-icon.png /usr/share/nginx/html/apple-touch-icon.png

EXPOSE 80
