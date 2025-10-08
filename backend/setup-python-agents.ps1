# Python AI Agents Setup Script
Write-Host "🐍 Setting up Python AI Agents..." -ForegroundColor Cyan

$pythonAgentsPath = Join-Path $PSScriptRoot "src\services\pythonAgents"

# Check if Python is installed
Write-Host "`nChecking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python 3.8 or higher" -ForegroundColor Red
    Write-Host "Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Check Python version
$versionMatch = $pythonVersion -match "Python (\d+)\.(\d+)"
if ($versionMatch) {
    $majorVersion = [int]$Matches[1]
    $minorVersion = [int]$Matches[2]
    
    if ($majorVersion -lt 3 -or ($majorVersion -eq 3 -and $minorVersion -lt 8)) {
        Write-Host "❌ Python 3.8 or higher is required (found $majorVersion.$minorVersion)" -ForegroundColor Red
        exit 1
    }
}

# Create virtual environment
Write-Host "`n📦 Creating virtual environment..." -ForegroundColor Yellow
Set-Location $pythonAgentsPath

if (Test-Path "venv") {
    Write-Host "Virtual environment already exists, removing..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force venv
}

python -m venv venv
Write-Host "✅ Virtual environment created" -ForegroundColor Green

# Activate virtual environment and install dependencies
Write-Host "`n📚 Installing Python packages..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Upgrade pip
python -m pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

Write-Host "`n✅ Python AI Agents setup complete!" -ForegroundColor Green
Write-Host "`nTo manually activate the environment, run:" -ForegroundColor Cyan
Write-Host "  cd backend\src\services\pythonAgents" -ForegroundColor White
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "`nTo test the Python server, run:" -ForegroundColor Cyan
Write-Host "  python main.py" -ForegroundColor White
Write-Host "`nThe Python agents will start automatically with the Node.js backend." -ForegroundColor Yellow

deactivate
