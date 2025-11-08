# ---- Stage 1: Build the React (Vite) app ----
FROM node:24.11-alpine AS build

# Enable pnpm via corepack (built into Node 24)
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy dependency files first (for better caching)
COPY package.json pnpm-lock.yaml ./

# Install dependencies (use frozen lockfile for reproducible builds)
RUN pnpm install --frozen-lockfile

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
