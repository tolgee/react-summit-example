#!/bin/bash

# Deploy script for Tolgee Voting App
# This script runs the Docker container and maps the data directory to server/data

echo "Deploying Tolgee Voting App..."

# Create data directory if it doesn't exist
mkdir -p server/data

# Run the Docker container
echo "Starting new container..."
docker run -d \
  --name tolgee-vote-app \
  -p 80:80 \
  -v "$(pwd)/server/data:/app/server/data" \
  localhost/tolgee/vote-app:latest

echo "Tolgee Voting App deployed successfully!"
echo "The application is now running at http://localhost:80"
