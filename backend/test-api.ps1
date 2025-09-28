# Test the AI Chat API
$body = @{
    message = "Hello AI mentor, can you help me learn JavaScript?"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5001/api/ai-chat" -Method POST -ContentType "application/json" -Body $body
    Write-Host "✅ API Response:" -ForegroundColor Green
    Write-Host $response.reply -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error testing API:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}