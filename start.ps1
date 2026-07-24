Write-Host "VoteSecure EVM - Setup & Start Script" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Check for Node.js
try {
    $nodeVer = node -v
    Write-Host "Node.js found: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# 1. Start MySQL (XAMPP usually)
Write-Host "Starting backend..." -ForegroundColor Yellow
cd backend
if (!(Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

# Start backend in a new window
Start-Process "node" -ArgumentList "server.js" -WindowStyle Normal -WorkingDirectory (Get-Location)
cd ..

# 2. Start Frontend
Write-Host "Starting frontend..." -ForegroundColor Yellow
cd frontend
if (!(Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

# Start frontend in a new window
Start-Process "npm" -ArgumentList "run dev" -WindowStyle Normal -WorkingDirectory (Get-Location)
cd ..

Write-Host "Backend running on http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend running on http://localhost:5173" -ForegroundColor Green
Write-Host "Setup complete!" -ForegroundColor Cyan
