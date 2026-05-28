#!/bin/bash

# VCC System - LAYRA Sidecar Setup Script
# This script deploys LAYRA alongside your Next.js application using Docker Compose

set -e

echo "🚀 Starting LAYRA Sidecar Setup..."

# Ensure we're in a separate directory for LAYRA
cd "$(dirname "$0")/.."
mkdir -p layra-sidecar
cd layra-sidecar

# Clone LAYRA if not already cloned
if [ ! -d "layra" ]; then
    echo "📦 Cloning LAYRA repository..."
    git clone https://github.com/liweiphys/layra.git
else
    echo "✅ LAYRA repository already cloned."
fi

cd layra

echo "⚙️ Configuring Environment Variables..."
# The repository provides a default .env file directly.

# Configure for Jina API (No local GPU embedding mode)
sed -i '' 's/EMBEDDING_MODEL=.*/EMBEDDING_MODEL=jina_embeddings_v4/g' .env
sed -i '' 's/JINA_EMBEDDINGS_V4_URL=.*/JINA_EMBEDDINGS_V4_URL=https:\/\/api.jina.ai\/v1\/embeddings/g' .env

# Extract API Keys from main app .env if available
echo "🔑 Attempting to copy API keys from main application..."
PARENT_ENV="../../.env"
if [ -f "$PARENT_ENV" ]; then
    OPENAI_KEY=$(grep -o '^OPENAI_API_KEY=.*' "$PARENT_ENV" | cut -d'=' -f2- | tr -d '"')
    
    if [ ! -z "$OPENAI_KEY" ]; then
        echo "Found OPENAI_API_KEY in parent .env"
        # Update or append to LAYRA .env
        if grep -q "^OPENAI_API_KEY=" .env; then
            sed -i '' "s/^OPENAI_API_KEY=.*/OPENAI_API_KEY=$OPENAI_KEY/g" .env
        else
            echo "OPENAI_API_KEY=$OPENAI_KEY" >> .env
        fi
    fi
    
    # Try to find a Jina key if it exists, otherwise use OpenAI base url for embeddings if supported
    JINA_KEY=$(grep -o '^JINA_API_KEY=.*' "$PARENT_ENV" | cut -d'=' -f2- | tr -d '"')
    if [ ! -z "$JINA_KEY" ]; then
        echo "Found JINA_API_KEY in parent .env"
        if grep -q "^JINA_API_KEY=" .env; then
            sed -i '' "s/^JINA_API_KEY=.*/JINA_API_KEY=$JINA_KEY/g" .env
        else
            echo "JINA_API_KEY=$JINA_KEY" >> .env
        fi
    else
        echo "⚠️ JINA_API_KEY not found in parent .env. Jina embeddings may fail if required."
    fi
else
    echo "⚠️ Parent .env file not found at $PARENT_ENV"
fi

echo "🐳 Starting Docker containers (No Local Embedding Mode)..."
docker compose -f docker-compose-no-local-embedding.yml up -d --build

echo "✅ LAYRA successfully deployed!"
echo "Backend API is available at http://localhost:8000"
echo "Frontend is available at http://localhost:3000"
echo ""
echo "Your VCC Application can now communicate with LAYRA via the local bridge API."
