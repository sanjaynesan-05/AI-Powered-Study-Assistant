# How to Run the AI-Powered Study Assistant

This guide consolidates all the necessary terminal commands to install dependencies, run the application, and execute tests.

## 1. Using Startup Scripts (Automated)

The easiest way to start both the backend and frontend simultaneously is to use the provided startup scripts from the root directory.

**For Windows:**
```bash
.\start_services.bat
```

**For macOS/Linux:**
```bash
./start_services.sh
```

---

## 2. Running Manually (Step-by-Step)

If you prefer to start the services in separate terminal windows, follow these steps.

### Backend (Python FastAPI)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd python-backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the server (runs on `http://localhost:8000`):
   ```bash
   venv\Scripts\python.exe -m uvicorn app.main:app --port 8000
   ```
   *(Ensure you have your `.env` file configured in this directory before starting).*

### Frontend (React)

1. Open a **new** terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server (runs on `http://localhost:3000`):
   ```bash
   npm run dev
   ```
   *(Note: The `README.md` mentions `npm start`, but `start_services.bat` uses `npm run dev`. Both usually work depending on package.json, but `npm run dev` is standard for tools like Vite/Next.js).*

---

## 3. Running Tests

To verify the system functionality via the test suite, run the following commands:

1. Navigate to the backend directory:
   ```bash
   cd python-backend
   ```
2. Install development dependencies (needed for testing):
   ```bash
   pip install -r requirements-dev.txt
   ```
3. Run the comprehensive test suite (Unit, API, and Integration tests):
   ```bash
   pytest tests/ -v
   ```
