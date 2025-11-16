# UnlistedHub USM - Quick Start Script
# Run this script from the UnlistedHub-USM directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  UnlistedHub USM - Quick Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "Error: Please run this script from the UnlistedHub-USM directory" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Setting up Backend..." -ForegroundColor Yellow
Write-Host ""

# Backend setup
Set-Location backend

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Green
    npm install
} else {
    Write-Host "Backend dependencies already installed" -ForegroundColor Green
}

if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from example..." -ForegroundColor Green
    Copy-Item .env.example .env
    Write-Host "⚠️  Please edit backend/.env and set your MongoDB URI and JWT secret" -ForegroundColor Yellow
} else {
    Write-Host ".env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Setting up Frontend..." -ForegroundColor Yellow
Write-Host ""

# Frontend setup
Set-Location ..\frontend

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Green
    npm install
} else {
    Write-Host "Frontend dependencies already installed" -ForegroundColor Green
}

if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from example..." -ForegroundColor Green
    Copy-Item .env.example .env
} else {
    Write-Host ".env file already exists" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Make sure MongoDB is running" -ForegroundColor White
Write-Host "2. Edit backend/.env file with your MongoDB URI and JWT secret" -ForegroundColor White
Write-Host "3. Start backend:  cd backend; npm run dev" -ForegroundColor White
Write-Host "4. Start frontend: cd frontend; npm start" -ForegroundColor White
Write-Host ""
Write-Host "📱 The app will open at http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔌 API will run at http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed instructions, see SETUP.md" -ForegroundColor Gray
Write-Host ""
