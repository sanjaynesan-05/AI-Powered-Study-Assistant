#!/bin/bash
cd "$(dirname "$0")"

# Kill any existing node processes
killall node 2>/dev/null || true

# Start backend server
cd backend
NODE_ENV=development PORT=5001 node server.js &

# Wait a moment for backend to start
sleep 2

# Start frontend server
cd ../frontend
npm run dev