# Trello Clone Setup Script

Write-Host "🚀 Setting up Trello Clone Application..." -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is accessible
Write-Host "Checking MySQL connection..." -ForegroundColor Yellow
try {
    mysql -e "SELECT 1" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ MySQL is running" -ForegroundColor Green
    } else {
        Write-Host "✗ MySQL is not accessible. Please start MySQL server." -ForegroundColor Red
        Write-Host "  Make sure MySQL is installed and running on localhost:3306" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "✗ MySQL check failed. Please ensure MySQL is installed." -ForegroundColor Red
    exit 1
}

# Create database if it doesn't exist
Write-Host ""
Write-Host "Creating database..." -ForegroundColor Yellow
mysql -e "CREATE DATABASE IF NOT EXISTS trello_clone;" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database 'trello_clone' ready" -ForegroundColor Green
} else {
    Write-Host "⚠ Could not create database. You may need to create it manually." -ForegroundColor Yellow
    Write-Host "  Run: CREATE DATABASE trello_clone;" -ForegroundColor Gray
}

# Setup Backend
Write-Host ""
Write-Host "Setting up backend..." -ForegroundColor Cyan
Set-Location server

if (Test-Path "node_modules") {
    Write-Host "✓ Backend dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Backend installation failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
}

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npm run prisma:generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Prisma client generated" -ForegroundColor Green
} else {
    Write-Host "✗ Prisma generation failed" -ForegroundColor Red
    exit 1
}

# Push database schema
Write-Host "Pushing database schema..." -ForegroundColor Yellow
npm run prisma:push
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database schema created" -ForegroundColor Green
} else {
    Write-Host "✗ Schema push failed" -ForegroundColor Red
    exit 1
}

# Seed database
Write-Host "Seeding database with sample data..." -ForegroundColor Yellow
npm run prisma:seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database seeded successfully" -ForegroundColor Green
} else {
    Write-Host "⚠ Seeding failed or already seeded" -ForegroundColor Yellow
}

Set-Location ..

# Setup Frontend
Write-Host ""
Write-Host "Setting up frontend..." -ForegroundColor Cyan
Set-Location client

if (Test-Path "node_modules") {
    Write-Host "✓ Frontend dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Frontend installation failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
}

Set-Location ..

# Success
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "✨ Setup Complete! ✨" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start the backend (in one terminal):" -ForegroundColor Yellow
Write-Host "   cd server" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the frontend (in another terminal):" -ForegroundColor Yellow
Write-Host "   cd client" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Check README.md for detailed documentation" -ForegroundColor Cyan
Write-Host ""
