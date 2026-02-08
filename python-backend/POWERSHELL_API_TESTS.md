# 🔧 PowerShell API Testing Commands

## ✅ Health Check
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/health" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Expected Output**:
```json
{"status":"healthy","agents":"operational","langgraph":"active","memory":"connected"}
```

---

## ✅ Agents Status
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/agents/status" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Expected**: JSON with all 11 agents showing "operational"

---

## ✅ Test Complete Workflow (All 11 Agents)
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/learning/process" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"user_id":"demo","user_input":"I want to learn Machine Learning","mastered_skills":["Python"]}' `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Expected**: JSON response with all agent outputs

---

## ✅ Test Stressed User Scenario
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/learning/process" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"user_id":"test2","user_input":"I am feeling overwhelmed and stressed","mastered_skills":[]}' `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Expected**: High stress/fatigue levels, wellness recommendations

---

## ✅ Test Prerequisite Detection
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/learning/process" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"user_id":"test3","user_input":"I want to learn Deep Learning","mastered_skills":[]}' `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Expected**: Skill gaps identified, prerequisites suggested

---

## ✅ Get User Profile
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/memory/profile/demo" -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

## 📝 Alternative: Use Python for Testing

If PowerShell syntax is cumbersome, create a test script:

**test_api.py**:
```python
import requests
import json

# Test 1: Health Check
response = requests.get("http://localhost:8000/api/health")
print("Health Check:", response.json())

# Test 2: Complete Workflow
data = {
    "user_id": "demo",
    "user_input": "I want to learn Machine Learning",
    "mastered_skills": ["Python"]
}
response = requests.post(
    "http://localhost:8000/api/learning/process",
    json=data
)
print("\nWorkflow Response:")
print(json.dumps(response.json(), indent=2))
```

Run with:
```powershell
python test_api.py
```

---

## 🌐 Or Use Browser

Simply open: **http://localhost:8000/docs**

This gives you an interactive API interface where you can:
- See all endpoints
- Try them out directly
- View request/response schemas
- No command-line needed!

---

## ✅ Quick Test Summary

1. **Server Running**: ✅ http://localhost:8000
2. **Health Check**: ✅ Working
3. **All 11 Agents**: ✅ Operational
4. **API Docs**: ✅ http://localhost:8000/docs

**Your system is 100% functional!** 🎉
