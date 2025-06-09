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

# Install a simple static file server
RUN npm install -g serve

# Expose ports for API and frontend
EXPOSE 3001
EXPOSE 3000

# Start both the server and frontend
CMD ["sh", "-c", "cd server && node dist/index.js & serve -s ../dist -l 3000"]