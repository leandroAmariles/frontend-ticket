# Multi-stage Dockerfile for the Angular frontend
# Stage 1: Build the production bundle
# Stage 2: Serve it with nginx

# ============================================
# Stage 1: Build
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build:prod

# ============================================
# Stage 2: Runtime
# ============================================
FROM nginx:1.27-alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s \
            --timeout=10s \
            --start-period=10s \
            --retries=3 \
    CMD wget -q -O- http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
