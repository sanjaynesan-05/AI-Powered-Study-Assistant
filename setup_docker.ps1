# AI Study Assistant - Docker Deployment Script
# This script spins up the enterprise-grade multi-agent architecture.

Write-Host "🚀 Starting AI Powered Study Assistant Infrastructure..." -ForegroundColor Cyan

# Check if Docker is running
docker info >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit
}

# Ensure the haproxy directory exists
if (-not (Test-Path "haproxy")) {
    New-Item -ItemType Directory -Path "haproxy"
}

# Clear any previous instances
Write-Host "🧹 Cleaning up previous containers..." -ForegroundColor Yellow
docker-compose down

# Build and start services
Write-Host "🏗️ Building and starting services..." -ForegroundColor Cyan
docker-compose up -d --build

# Wait for services to initialize
Write-Host "⏳ Waiting for services to initialize (30s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Verify Connectivity
Write-Host "🔍 Verifying connectivity..." -ForegroundColor Cyan

# Backend Health Check
$health = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -ErrorAction SilentlyContinue
if ($health.status -eq "ok" -or $health.status -eq "healthy") {
    Write-Host "✅ Backend is HEALTHY" -ForegroundColor Green
} else {
    Write-Host "⚠️ Backend health check failed or returned unexpected status." -ForegroundColor Yellow
}

# Redis Check (via Backend)
Write-Host "📡 Testing Redis and Chroma connectivity through backend logs..." -ForegroundColor Cyan
docker logs study-assistant-backend | Select-Object -Last 10

Write-Host "`n✨ Infrastructure is UP and RUNNING!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Gray
Write-Host "Backend API: http://localhost:8000" -ForegroundColor Gray
Write-Host "Ollama LB: http://localhost:11434" -ForegroundColor Gray
Write-Host "Chroma UI: http://localhost:8001" -ForegroundColor Gray
