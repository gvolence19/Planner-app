#!/bin/bash

# Ensure the script stops on any error
set -e

echo "=== DigitalOcean App Startup ==="
echo "Current directory: $(pwd)"
echo "Files in root:"
ls -la

# Make sure we're using the right port
export PORT=8080
export NODE_ENV=production

echo "Starting Node.js server on port $PORT"
exec node server.js