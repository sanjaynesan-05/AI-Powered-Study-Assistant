@echo off
echo Starting AI Mentor Platform services...

echo Starting Backend Server...
start cmd /k "cd python-backend && python -m uvicorn app.main:app --reload --port 8000"

echo Starting Frontend Development Server...
start cmd /k "cd frontend && npm run dev"

echo AI Mentor Platform is starting up!
echo Backend will be available at http://localhost:8000
echo Frontend will be available at http://localhost:3000
