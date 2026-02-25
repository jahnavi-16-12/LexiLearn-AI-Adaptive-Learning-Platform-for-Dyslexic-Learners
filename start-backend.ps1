# LexiLearn AI - Backend Startup Script
Write-Host "🚀 Starting LexiLearn AI Backend..." -ForegroundColor Cyan

# Activate virtual environment
Write-Host "📦 Activating virtual environment..." -ForegroundColor Yellow
& "$PSScriptRoot\.venv\Scripts\Activate.ps1"

# Navigate to backend directory
Set-Location "$PSScriptRoot\backend"

# Start uvicorn server
Write-Host "✨ Starting FastAPI server on http://127.0.0.1:8000" -ForegroundColor Green
uvicorn main:app --reload
