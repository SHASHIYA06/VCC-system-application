#!/bin/bash

echo "Testing RAG API..."
echo "=================="

# Test if server is running
echo "Checking if server is running..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/rag?action=status

if [ $? -eq 7 ]; then
  echo "Server not running. Starting development server..."
  npm run dev &
  sleep 10
fi

echo "Testing API call..."
curl -X POST http://localhost:3000/api/rag \
  -H "Content-Type: application/json" \
  -d '{"query":"What is TRAC system?"}' \
  -m 30

echo ""
echo "Done."