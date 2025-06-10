[<img src="https://raw.githubusercontent.com/tolgee/documentation/main/tolgee_logo_text.svg" alt="Tolgee" width="100" />](https://tolgee.io)

# Tolgee Voting App

A real-time voting application built with React and Node.js, showcasing the translation capabilities of [Tolgee](https://tolgee.io). This application allows users to vote and see results in real-time.

Written for a React Summit 2025 with a purpose to playfully showcase the Tolgee capabilities to everyone attending the conference.

The code was partially created using techniques that could fall into the category "vibe coding."
Viewer discretion is advised—code readability is substantially limited compared to usual Tolgee standards.

## Live Demo

Visit [https://vote.tolgee.io](https://vote.tolgee.io) to see the application in action.

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A Tolgee account and project (for translation features)

### Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/tolgee/react-summit-example.git
   cd react-summit-example
   ```

2. Install dependencies for both frontend and backend:
   ```
   npm install
   cd server
   npm install
   cd ..
   ```

3. Configure environment variables:
   - Copy `.env` to `.env.development.local`
   - Set `VITE_APP_TOLGEE_API_KEY` to your Tolgee API key
   - Set `VITE_APP_TOLGEE_PROJECT_ID` to your Tolgee project ID
   - Set `VITE_APP_TOLGEE_CDN_URL` to your Tolgee CDN url prefix
   - Set `VITE_APP_URL` to your application URL (default: 'https://vote.tolgee.io')

   Server environment variables:
   - `PORT`: Port for the server (default: 3001)
   - `DATA_DIR`: Custom path for the data directory (default: './server/data')

4. Start the backend server:
   ```
   cd server
   npm run dev
   ```

5. In a new terminal, start the frontend development server:
   ```
   npm run develop
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

Note: In development mode, the frontend and backend run separately on different ports. In production, the Node.js server serves both the API and the frontend static files on the same port.

### Production Deployment

#### Using Docker

Build and run the application using Docker:

```
docker build -t vote-app .
docker run -p 80:80 -e DATA_DIR=/app/data -e VITE_APP_URL=https://your-domain.com vote-app
```

You can mount a volume to persist the data:

```
docker run -p 80:80 -e DATA_DIR=/app/data -e VITE_APP_URL=https://your-domain.com -v $(pwd)/data:/app/data vote-app
```

The Docker image runs the Node.js server on port 80, which serves both the API and the frontend static files.

#### Using Kubernetes

1. Update the configuration in `kubernetes/configmap.yaml` and `kubernetes/secret.yaml`
   - The `DATA_DIR` environment variable is set to `/app/data` in the ConfigMap
   - The `APP_URL` environment variable is set to your application URL (default: 'https://vote.tolgee.io')
   - The `API_URL` environment variable is set to your API URL (default: 'https://vote.tolgee.io/api')
   - A persistent volume is mounted at the data path
2. Deploy to your Kubernetes cluster:
   ```
   kubectl apply -k kubernetes/
   ```

## Technology Stack

- **Frontend**: React, Vite, Tolgee SDK
- **Backend**: Node.js, Express, WebSockets
- **Database**: SQLite
- **Deployment**: Docker, Kubernetes

## License

This project is licensed under the MIT License—see the LICENSE file for details.
