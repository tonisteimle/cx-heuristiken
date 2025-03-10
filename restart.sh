#!/bin/bash
echo "Stopping any running server..."
pkill -f "node server/server.js" || true
echo "Starting server..."
cd "$(dirname "$0")"
node server/server.js &
echo "Server restarted! Please refresh your browser tabs."
