#!/bin/bash

echo "Starting AI Mentor Platform services..."

echo "Starting Backend Server..."
gnome-terminal -- bash -c "cd python-backend && python -m uvicorn app.main:app --reload --port 8000; exec bash" &

echo "Starting Frontend Development Server..."
gnome-terminal -- bash -c "cd frontend && npm run dev; exec bash" &

echo "AI Mentor Platform is starting up!"
echo "Backend will be available at http://localhost:8000"
echo "Frontend will be available at http://localhost:3000"
