# Full Stack Integration Guide

## 🎯 Overview

This guide provides complete setup instructions for the AI-Powered Study Assistant, ensuring seamless integration between the React frontend and Python FastAPI backend.

## 📋 Prerequisites

Before starting, ensure you have:
- **Python 3.8+** installed
- **Node.js 16+** and npm installed
- **MongoDB Atlas** account (free tier works)
- **Google AI API Key** (Gemini)
- **YouTube Data API v3 Key**

---

## 🔑 Required API Keys

### 1. Google AI (Gemini) API Key
**Purpose**: Powers all 11 AI agents (orchestration, personalization, skill graph, etc.)

**How to get**:
1. Visit https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### 2. YouTube Data API v3 Key
**Purpose**: Learning resource recommendations (video content)

**How to get**:
1. Visit https://console.cloud.google.com/apis/credentials
2. Create a new project or select existing
3. Enable "YouTube Data API v3"
4. Create credentials → API Key
5. Copy the key

### 3. MongoDB Atlas Connection String
**Purpose**: Database for user data and long-term memory

**How to get**:
1. Visit https://cloud.mongodb.com/
2. Create a free cluster
3. Create a database user
4. Get connection string (replace `<password>` with your password)

---

## ⚙️ Backend Setup

### Step 1: Navigate to Backend
```bash
cd python-backend
```

### Step 2: Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and fill in your actual values:
```env
# Server
PORT=8000
ENVIRONMENT=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai_study_assistant?retryWrites=true&w=majority

# AI Services
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here

# Authentication
JWT_SECRET=your_secure_jwt_secret_here_minimum_32_characters
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=43200

# Vector Database
CHROMA_PERSIST_DIRECTORY=./chroma_db

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
```

### Step 5: Start Backend Server
```bash
python -m uvicorn app.main:app --reload --port 8000
```

**Expected Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 6: Verify Backend
Open browser to http://localhost:8000
You should see:
```json
{
  "message": "AI Study Assistant GenAI API",
  "version": "2.0.0",
  "status": "operational",
  "agents": 11
}
```

---

## 🎨 Frontend Setup

### Step 1: Navigate to Frontend
```bash
cd frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

The `.env` file should contain:
```env
# Backend API
VITE_API_URL=http://localhost:8000
VITE_BACKEND_URL=http://localhost:8000

# YouTube API
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
```

### Step 4: Start Frontend Server
```bash
npm run dev
```

**Expected Output**:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 5: Verify Frontend
Open browser to http://localhost:5173
The application should load successfully.

---

## 🚀 Quick Start (Both Services)

Use the provided start scripts:

**Windows**:
```bash
start_services.bat
```

**Linux/Mac**:
```bash
chmod +x start_services.sh
./start_services.sh
```

This will start both backend (port 8000) and frontend (port 5173) simultaneously.

---

## 📡 API Endpoints Reference

### Core Endpoints
- `GET /` - API information
- `GET /health` - Simple health check
- `GET /api/health` - Detailed health check
- `GET /api/agents/status` - All agents status

### Agent-Specific Endpoints
- `POST /study-plan` - Generate study plan
- `POST /learning-resources` - Get learning resources
- `POST /assessment` - Generate assessment
- `POST /wellness-assessment` - Wellness check
- `POST /schedule-optimization` - Optimize schedule
- `POST /motivation-boost` - Get motivation
- `POST /personalization` - Personalization settings

### LangGraph Orchestration
- `POST /api/learning/process` - Full workflow (all 11 agents)

### Memory
- `GET /api/memory/profile/{user_id}` - User profile

---

## 🧪 Testing the Integration

### 1. Test Backend Health
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-08T16:00:00.000000"
}
```

### 2. Test Learning Resources Endpoint
```bash
curl -X POST http://localhost:8000/learning-resources \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Python Programming",
    "level": "beginner",
    "format": ["video"],
    "preferences": ["visual"]
  }'
```

### 3. Test Frontend Connection
1. Open http://localhost:5173
2. Open browser console (F12)
3. Check for any API errors
4. Navigate through the app

---

## 🔧 Troubleshooting

### Backend Issues

**Issue**: `ModuleNotFoundError`
**Solution**: Ensure virtual environment is activated and dependencies installed
```bash
pip install -r requirements.txt
```

**Issue**: `CORS error` in browser
**Solution**: Check `CORS_ORIGINS` in `.env` includes your frontend URL

**Issue**: `MongoDB connection failed`
**Solution**: Verify `MONGODB_URI` is correct and network access is allowed

### Frontend Issues

**Issue**: `Failed to fetch` errors
**Solution**: Ensure backend is running on port 8000

**Issue**: Environment variables not loading
**Solution**: Restart Vite dev server after changing `.env`

**Issue**: YouTube videos not loading
**Solution**: Verify `VITE_YOUTUBE_API_KEY` is set correctly

---

## 📊 Environment Variables Summary

### Backend (.env)
| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URI` | ✅ Yes | Database connection |
| `GOOGLE_AI_API_KEY` | ✅ Yes | AI agents (Gemini) |
| `YOUTUBE_API_KEY` | ✅ Yes | Video recommendations |
| `JWT_SECRET` | ✅ Yes | Authentication |
| `PORT` | ⚠️ Optional | Server port (default: 8000) |
| `CORS_ORIGINS` | ⚠️ Optional | Allowed origins |

### Frontend (.env)
| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_API_URL` | ✅ Yes | Backend API URL |
| `VITE_YOUTUBE_API_KEY` | ✅ Yes | YouTube integration |
| `VITE_BACKEND_URL` | ⚠️ Optional | Alternative backend URL |

---

## ✅ Verification Checklist

- [ ] Python backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:8000
- [ ] Can access http://localhost:5173
- [ ] No CORS errors in browser console
- [ ] API calls from frontend reach backend
- [ ] MongoDB connection successful
- [ ] AI agents respond to requests
- [ ] YouTube videos load in learning resources

---

## 🎓 Next Steps

1. **Test all features** - Navigate through the app and test each agent
2. **Check logs** - Monitor backend console for any errors
3. **Customize** - Adjust learning preferences and test personalization
4. **Deploy** - Follow deployment guide for production setup

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure all required services (MongoDB, APIs) are accessible
4. Check backend logs for detailed error messages

**Backend Logs**: Check terminal where `uvicorn` is running
**Frontend Logs**: Check browser console (F12 → Console tab)
