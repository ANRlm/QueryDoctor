# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY frontend/ ./

# Build
RUN npm run build

# Final stage
FROM nginx:alpine

# Copy nginx config
COPY docker/frontend.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Run
CMD ["nginx", "-g", "daemon off;"]
