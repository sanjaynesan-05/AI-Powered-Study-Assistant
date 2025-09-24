#!/bin/bash

echo "Starting AI Mentor Platform services..."

echo "Starting Backend Server..."
gnome-terminal -- bash -c "cd backend && npm run dev; exec bash" &

echo "Starting Frontend Development Server..."
gnome-terminal -- bash -c "cd frontend && npm run dev; exec bash" &

echo "AI Mentor Platform is starting up!"
echo "Backend will be available at http://localhost:5000"
echo "Frontend will be available at http://localhost:3000"
