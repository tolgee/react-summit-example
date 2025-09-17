# Multi-stage build for React app and Node.js server

# Stage 1: Build the React app
FROM docker.io/library/node:24.8.0-alpine3.22 as frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Set default environment variables for the build
ARG VITE_APP_URL=https://vote.tolgee.io
ENV VITE_APP_URL=${VITE_APP_URL}
ARG VITE_APP_TOLGEE_API_URL
ENV VITE_APP_TOLGEE_API_URL=${VITE_APP_TOLGEE_API_URL}
ARG VITE_APP_TOLGEE_API_KEY
ENV VITE_APP_TOLGEE_API_KEY=${VITE_APP_TOLGEE_API_KEY}
ARG VITE_APP_TOLGEE_CDN_URL
ENV VITE_APP_TOLGEE_CDN_URL=${VITE_APP_TOLGEE_CDN_URL}
ARG VITE_APP_TOLGEE_PROJECT_ID
ENV VITE_APP_TOLGEE_PROJECT_ID=${VITE_APP_TOLGEE_PROJECT_ID}
RUN npm run build

# Stage 2: Build the Node.js server
FROM docker.io/library/node:24.8.0-alpine3.22 as server-build
WORKDIR /app
COPY server/package*.json ./
RUN npm install
COPY server ./
RUN npm run build

# Stage 3: Production environment
FROM docker.io/library/node:24.8.0-alpine3.22
WORKDIR /app

# Copy built server
COPY --from=server-build /app/dist ./server/dist
COPY --from=server-build /app/node_modules ./server/node_modules
COPY --from=server-build /app/package.json ./server/

# Copy built frontend
COPY --from=frontend-build /app/dist ./dist

# Create data directory for SQLite
RUN mkdir -p /app/server/data

# Expose port 80 for the server
EXPOSE 80

# Start the server only (it will serve the frontend)
CMD ["sh", "-c", "cd server && PORT=80 NODE_ENV=production node dist/index.js"]
