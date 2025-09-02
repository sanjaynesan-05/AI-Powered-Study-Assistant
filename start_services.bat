@echo off
echo Starting AI Mentor Platform services...

echo Starting Backend Server...
start cmd /k "cd backend && npm run dev"

echo Starting Frontend Development Server...
start cmd /k "cd frontend && npm run dev"

echo AI Mentor Platform is starting up!
echo Backend will be available at http://localhost:5000
echo Frontend will be available at http://localhost:5173
