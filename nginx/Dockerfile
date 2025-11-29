# --- Build frontend ---
FROM node:20 AS build

WORKDIR /app

# Copy frontend package files
COPY Frontend/package*.json ./

# Install dependencies (no lockfile needed)
RUN npm install

# Copy the rest of the frontend source
COPY Frontend ./

# Build production assets (Vite)
RUN npm run build

# --- Runtime stage: nginx serving built frontend & proxying API ---
FROM nginx:1.27-alpine

# Copy nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Static uploads will be mounted via volume
EXPOSE 80
