#!/bin/bash

# Build script for Tolgee Voting App
# This script builds a Docker image named localhost/tolgee/vote-app:latest

echo "Building Docker image for Tolgee Voting App..."

# Build arguments for passing environment variables to Docker build
BUILD_ARGS=""

# Pass all VITE_ environment variables to the build
for var in $(env | grep '^VITE_' | cut -d= -f1); do
  value=$(eval echo \$$var)
  BUILD_ARGS="$BUILD_ARGS --build-arg $var=$value"
done

# Build the Docker image
docker build $BUILD_ARGS -t localhost/tolgee/vote-app:latest .

echo "Docker image localhost/tolgee/vote-app:latest built successfully!"