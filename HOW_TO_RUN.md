# 🚀 How to Run: AI Study Assistant (GenAI v2.0)

This guide provides the complete set of commands to boot the multi-agent AI environment, orchestrate the LLMs, and access the live demo dashboard.

---

## 🛠️ Step 1: LLM Setup (Ollama)
The system requires specific models to be installed locally. Open a terminal and run:

```bash
# Pull the core models
ollama pull llama3.2:3b          # Main Demo/Learning model
ollama pull qwen2.5:3b-instruct   # Intent Classification
ollama pull qwen2.5-coder:7b     # Specialized Coding agent
ollama pull mistral:7b           # Evaluation & Reasoning
ollama pull nomic-embed-text      # Memory/RAG embeddings
ollama pull KMENTOR_v2.0          # Mentor agent
```

---

## 🐍 Step 2: Backend Setup (FastAPI)
Navigate to the backend directory, install dependencies, and pre-warm the VRAM.

```bash
# 1. Navigate to backend
cd python-backend

# 2. Setup Virtual Environment (if not already done)
python -m venv venv
.\venv\Scripts\activate

# 3. Install Core & Demo Dependencies
pip install -r requirements.txt
pip install jinja2

# 4. Pre-warm the Models (CRITICAL for demo speed)
# This loads all 3B and 7B models into your GPU memory ahead of time.
python prewarm_demo.py
```

---

## 🏃 Step 3: Start the Backend
Start the production-ready FastAPI server with monitoring and demo flags active.

```bash
# Run the server on port 8001
venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

---

## 💻 Step 4: Start the Frontend (Optional)
If you are using the React interface, start it in a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

---

## 📊 Step 5: Access the Demo & Monitoring
Once the services are running, use these URLs to interact with and evaluate the system:

| Endpoint | Purpose | URL |
| :--- | :--- | :--- |
| **Demo Dashboard** | Visual interface for the multi-agent demo | [http://127.0.0.1:8001/view-demo](http://127.0.0.1:8001/view-demo) |
| **System Health** | Rich diagnostic report of all services | [http://127.0.0.1:8001/health](http://127.0.0.1:8001/health) |
| **Full Metrics** | Real-time performance & agent success rates | [http://127.0.0.1:8001/metrics](http://127.0.0.1:8001/metrics) |
| **Model Registry** | List of loaded and available LLMs | [http://127.0.0.1:8001/demo](http://127.0.0.1:8001/demo) |

---

## 🧪 Quick Verification
You can test the backend pipeline directly from PowerShell:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8001/ai" `
  -Method Post `
  -ContentType "application/json" `
  -Body "{'prompt': 'Write a Python script for a binary search.'}"
```

---

**Note:** Ensure `DEMO_MODE=True` is set in `app/config.py` for high-speed lightweight routing during the presentation.
