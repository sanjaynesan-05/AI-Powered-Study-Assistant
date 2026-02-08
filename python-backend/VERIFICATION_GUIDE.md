# 🧪 Complete System Verification Guide

## Quick Verification Steps

### Step 1: Install Dependencies
```bash
cd python-backend
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### Step 2: Verify Imports
```bash
python -c "from app.main import app; print('✅ Backend imports successful')"
python -c "from app.langgraph.graph import learning_graph; print('✅ LangGraph compiled')"
python -c "from app.agents import *; print('✅ All agents imported')"
```

### Step 3: Run Unit Tests
```bash
pytest tests/test_agents.py -v
```

### Step 4: Run API Tests
```bash
pytest tests/test_api.py -v
```

### Step 5: Run Integration Tests
```bash
pytest tests/test_integration.py -v
```

### Step 6: Start Server
```bash
uvicorn app.main:app --reload --port 8000
```

### Step 7: Test API Endpoints

**Health Check**:
```bash
curl http://localhost:8000/api/health
```

**Agents Status**:
```bash
curl http://localhost:8000/api/agents/status
```

**Complete Workflow Test**:
```bash
curl -X POST http://localhost:8000/api/learning/process \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"test\",\"user_input\":\"I want to learn Python\",\"mastered_skills\":[]}"
```

---

## Expected Results

### ✅ Successful Backend Test
```json
{
  "success": true,
  "intent": "learning",
  "emotional_tone": "excited",
  "current_skill": "Python",
  "agent_outputs": {
    "personalization": {...},
    "skill_graph": {...},
    "learning_resource": {...},
    "assessment": {...},
    "wellness": {...},
    "scheduler": {...},
    "reflection": {...},
    "motivation": {...},
    "explainability": {...}
  },
  "explanations": {
    "Why this learning path?": "...",
    "Why this difficulty?": "..."
  },
  "reasoning_chain": [...]
}
```

---

## Frontend Verification

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Update API URL
Edit `frontend/src/services/aiAgentService.ts`:
```typescript
const API_URL = 'http://localhost:8000';
```

### Step 3: Start Frontend
```bash
npm start
```

### Step 4: Test Components
1. Open http://localhost:3000
2. Verify Agent Orchestration View renders
3. Check Skill Graph visualization
4. Test Explainability Panel
5. Verify Wellness Meter

---

## Manual Testing Checklist

### Backend Tests
- [ ] Server starts without errors
- [ ] Health check returns 200
- [ ] All 11 agents status shows "operational"
- [ ] Learning request processes successfully
- [ ] All agents execute in workflow
- [ ] Explanations are generated
- [ ] Memory stores interaction

### Frontend Tests
- [ ] App loads without errors
- [ ] API service connects to backend
- [ ] Agent orchestration displays
- [ ] Skill graph renders
- [ ] Explainability panel works
- [ ] Wellness meter shows data

### Integration Tests
- [ ] Frontend → Backend communication works
- [ ] All 11 agents execute
- [ ] State flows through LangGraph
- [ ] Memory persists
- [ ] Reflection triggers replanning when needed

---

## Troubleshooting

### Issue: Import Errors
**Solution**: Ensure all `__init__.py` files exist
```bash
# Create missing __init__.py files
New-Item -ItemType File -Path app/__init__.py
New-Item -ItemType File -Path app/agents/__init__.py
New-Item -ItemType File -Path app/langgraph/__init__.py
New-Item -ItemType File -Path app/memory/__init__.py
New-Item -ItemType File -Path app/utils/__init__.py
```

### Issue: LangGraph Error
**Solution**: Update LangGraph
```bash
pip install --upgrade langgraph langchain
```

### Issue: MongoDB Connection
**Solution**: Check `.env` file has correct `MONGODB_URI`

### Issue: Gemini API Error
**Solution**: Verify `GOOGLE_AI_API_KEY` in `.env`

---

## Automated Test Script

Run all tests automatically:
```bash
python run_tests.py
```

This will:
1. Check dependencies
2. Test imports
3. Run unit tests
4. Run API tests
5. Run integration tests
6. Validate LangGraph
7. Generate summary report

---

## Success Criteria

✅ **100% Functional** if:
- All imports work
- All tests pass
- Server starts successfully
- API endpoints respond correctly
- All 11 agents execute
- LangGraph workflow completes
- Frontend connects to backend
- No errors in console

---

## Performance Benchmarks

Expected performance:
- **Server startup**: < 5 seconds
- **API response time**: 2-4 seconds
- **Agent execution**: ~200ms per agent
- **Total workflow**: 2-3 seconds
- **Memory usage**: ~200MB

---

## Next Steps After Verification

1. ✅ System verified and working
2. Deploy to staging
3. Conduct user testing
4. Prepare SIH demo
5. Create presentation

**Status**: Ready for Production 🚀
