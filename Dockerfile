# ---- Stage 1: Build the React (Vite) app ----
FROM node:24.11-alpine AS build

# Enable pnpm via corepack (built into Node 24)
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# Set working directory
WORKDIR /app

# patch-package needs git available
RUN apk add --no-cache git

# Copy dependency files first (for better caching)
COPY package.json pnpm-lock.yaml ./

# Install dependencies (lockfile may be out of sync in CI, avoid failing build)
# Include dev deps for build tools (vite, typescript, patch-package)
RUN pnpm install

# Copy the rest of the application
COPY . .

# Build the app for production
RUN pnpm run build


# ---- Stage 2: Serve the built app with Nginx ----
FROM nginx:stable-alpine AS production

# Copy build output from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Optional: use your own nginx config (for React Router, etc.)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
