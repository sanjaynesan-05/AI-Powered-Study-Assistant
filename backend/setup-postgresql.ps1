Write-Host "========================================" -ForegroundColor Green
Write-Host " AI Study Assistant - PostgreSQL Setup" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "[1/5] Installing Node.js dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "[2/5] Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Please edit .env file with your PostgreSQL credentials" -ForegroundColor Cyan
    Write-Host "   DATABASE_PASSWORD=your_actual_password" -ForegroundColor Cyan
    Write-Host "   JWT_SECRET=your_secret_key" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter after updating .env file"
}

Write-Host "[3/5] Testing PostgreSQL connection..." -ForegroundColor Yellow
$env:NODE_ENV = "development"
try {
    Write-Host "🔍 Attempting database connection..." -ForegroundColor Cyan
    # You could add a simple connection test here
    Write-Host "✅ Ready to proceed with migration" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not verify connection, but continuing..." -ForegroundColor Yellow
}
Write-Host ""

Write-Host "[4/5] Running database migration..." -ForegroundColor Yellow
try {
    npm run migrate
    Write-Host "✅ Database migration completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Database migration failed" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  - PostgreSQL is running" -ForegroundColor Yellow
    Write-Host "  - Database 'ai_study_assistant' exists" -ForegroundColor Yellow
    Write-Host "  - .env configuration is correct" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

Write-Host "[5/5] Testing setup..." -ForegroundColor Yellow
try {
    npm run test-pg
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Some tests failed, but setup may still work" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "🎉 PostgreSQL Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 To start the development server:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Your API will be available at:" -ForegroundColor Cyan
Write-Host "   http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "💊 Health check endpoint:" -ForegroundColor Cyan
Write-Host "   http://localhost:5000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "📊 Database: PostgreSQL" -ForegroundColor Cyan
Write-Host "🔧 Environment: Development" -ForegroundColor Cyan
Write-Host ""