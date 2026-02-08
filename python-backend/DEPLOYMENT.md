# Deployment Configuration

## Railway Deployment

### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Steps:
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add environment variables in Railway dashboard
5. Deploy: `railway up`

---

## Render Deployment

### render.yaml
```yaml
services:
  - type: web
    name: ai-study-assistant
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: GOOGLE_AI_API_KEY
        sync: false
      - key: MONGODB_URI
        sync: false
      - key: YOUTUBE_API_KEY
        sync: false
```

### Steps:
1. Connect GitHub repository
2. Select `python-backend` as root directory
3. Add environment variables
4. Deploy

---

## Docker Deployment

### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - GOOGLE_AI_API_KEY=${GOOGLE_AI_API_KEY}
      - MONGODB_URI=${MONGODB_URI}
      - YOUTUBE_API_KEY=${YOUTUBE_API_KEY}
    restart: unless-stopped
```

### Commands:
```bash
docker build -t ai-study-assistant .
docker run -p 8000:8000 --env-file .env ai-study-assistant
```

---

## Google Cloud Run

```bash
# Build
gcloud builds submit --tag gcr.io/PROJECT_ID/ai-study-assistant

# Deploy
gcloud run deploy ai-study-assistant \
  --image gcr.io/PROJECT_ID/ai-study-assistant \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_AI_API_KEY=$GOOGLE_AI_API_KEY
```

---

## Environment Variables (Production)

Required for all deployments:
```env
GOOGLE_AI_API_KEY=your_key
MONGODB_URI=your_mongodb_uri
YOUTUBE_API_KEY=your_youtube_key
JWT_SECRET=your_secret
ENVIRONMENT=production
```

---

## Health Checks

All platforms should configure:
- **Health Check URL**: `/api/health`
- **Expected Response**: `{"status": "healthy"}`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds

---

## Monitoring

### Recommended Tools:
- **Sentry**: Error tracking
- **New Relic**: Performance monitoring
- **Datadog**: Infrastructure monitoring

### Setup Sentry:
```python
# app/main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,
)
```
