# Multi-stage build for React app and Node.js server

# Stage 1: Build the React app
FROM node:18-alpine as frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build the Node.js server
FROM node:18-alpine as server-build
WORKDIR /app
COPY server/package*.json ./
RUN npm install
COPY server ./
RUN npm run build

# Stage 3: Production environment
FROM node:18-alpine
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
