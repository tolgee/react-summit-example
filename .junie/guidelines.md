# Tolgee Voting App Development Guidelines

This document provides guidelines and information for developers working on the Tolgee Voting App project.

## Build and Configuration Instructions

### Prerequisites
- Node.js 16+ and npm
- A Tolgee account and project (for translation features)

### Development Setup

1. **Install Dependencies**
   ```bash
   # Install frontend dependencies
   npm install

   # Install server dependencies
   cd server
   npm install
   cd ..
   ```

2. **Configure Environment Variables**
   - Copy `.env` to `.env.development.local`
   - Set `VITE_APP_TOLGEE_API_KEY` to your Tolgee API key
   - Set `VITE_APP_TOLGEE_PROJECT_ID` to your Tolgee project ID
   - Set `VITE_APP_TOLGEE_CDN_URL` to your Tolgee CDN url prefix

   Server environment variables:
   - `PORT`: Port for the server (default: 3001)
   - `DATA_DIR`: Custom path for the data directory (default: './server/data')

3. **Start Development Servers**
   ```bash
   # Start the backend server
   cd server
   npm run dev

   # In a new terminal, start the frontend
   npm run develop
   ```

4. **Access the Application**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:3001/api](http://localhost:3001/api)

### Production Build

1. **Build the Application**
   ```bash
   # Build the frontend
   npm run build

   # Build the server
   cd server
   npm run build
   cd ..
   ```

2. **Run in Production Mode**
   ```bash
   cd server
   npm start
   ```

### Docker Deployment

Build and run the application using Docker:

```bash
docker build -t vote-app .
docker run -p 3000:3000 -p 3001:3001 -e DATA_DIR=/app/data vote-app
```

You can mount a volume to persist the data:

```bash
docker run -p 3000:3000 -p 3001:3001 -e DATA_DIR=/app/data -v $(pwd)/data:/app/data vote-app
```

### Kubernetes Deployment

1. Update the configuration in `kubernetes/configmap.yaml` and `kubernetes/secret.yaml`
2. Deploy to your Kubernetes cluster:
   ```bash
   kubectl apply -k kubernetes/
   ```

## Code Style and Development Practices

### TypeScript

- The project uses TypeScript for both frontend and backend
- Strict type checking is enabled
- Use explicit type annotations for function parameters and return types
- Use interfaces for complex object types
- Avoid unnecessary comments and too chatty code—the code will be read only by experienced developers

### Backend (Node.js/Express)

- Use async/await for asynchronous operations
- Promisify callback-based APIs (like SQLite) for easier use with async/await
- Use proper error handling with try/catch blocks
- Log errors with appropriate context
- Use environment variables for configuration

### Database (SQLite)

- Database operations are promisified for use with async/await
- Use parameterized queries to prevent SQL injection
- Tables use STRICT mode for better type safety
- Foreign key constraints are enabled

### WebSockets

- WebSockets are used for real-time updates
- The server broadcasts updates to all connected clients when data changes
- Error handling is implemented for WebSocket operations

### Frontend (React)

- The frontend is built with React and Vite
- Tolgee is used for internationalization
- Components are organized by feature
- State management is handled through React hooks

### Error Handling

- Use try/catch blocks for error handling
- Log errors with appropriate context
- Return appropriate HTTP status codes for API errors
- Provide meaningful error messages to clients
