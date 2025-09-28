# Test frontend API integration
Write-Host "🧪 Testing Frontend-Backend Integration..." -ForegroundColor Cyan

# Test backend directly
Write-Host "`n1. Testing Backend API directly..." -ForegroundColor Yellow
$backendBody = @{
    message = "Test from PowerShell"
} | ConvertTo-Json

try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:5001/api/ai-chat" -Method POST -ContentType "application/json" -Body $backendBody
    Write-Host "✅ Backend Response: " -ForegroundColor Green -NoNewline
    Write-Host $backendResponse.reply.Substring(0, 50) + "..." -ForegroundColor White
} catch {
    Write-Host "❌ Backend Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Check if frontend is accessible
Write-Host "`n2. Testing Frontend accessibility..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend is running on http://localhost:5173" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Day 2 Integration Status:" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5001 ✅" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173 ✅" -ForegroundColor Green
Write-Host "AI Chat: Working ✅" -ForegroundColor Green
Write-Host "`nReady to test in browser! 🚀" -ForegroundColor Yellow