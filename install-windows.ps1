# Jira Ticket Organizer — Windows Setup Script
# Called by install-windows.bat with -ExecutionPolicy Bypass

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " Jira Ticket Organizer — Windows Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to script directory
Set-Location $PSScriptRoot

# ── Check for Node.js ─────────────────────────────────────
$nodeVersion = $null
try {
    $nodeVersion = & node --version 2>$null
} catch {}

if ($nodeVersion) {
    Write-Host "✓ Node.js already installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "Node.js not found." -ForegroundColor Yellow
    Write-Host ""

    # Try winget (ships with Windows 11 by default)
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($winget) {
        Write-Host "Installing Node.js via winget..." -ForegroundColor Cyan
        winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements

        # Refresh PATH so npm is available in this session
        $machinePath = [System.Environment]::GetEnvironmentVariable("PATH", "Machine")
        $userPath    = [System.Environment]::GetEnvironmentVariable("PATH", "User")
        $env:PATH    = "$machinePath;$userPath"

        Write-Host ""
        Write-Host "✓ Node.js installed." -ForegroundColor Green
        Write-Host ""
        Write-Host "NOTE: If the next step fails, close this window and run install-windows.bat" -ForegroundColor Yellow
        Write-Host "again — Windows sometimes needs a fresh session to pick up the new PATH." -ForegroundColor Yellow
    } else {
        Write-Host "winget is not available on this machine." -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install Node.js manually:" -ForegroundColor White
        Write-Host "  → https://nodejs.org  (download the LTS Windows installer)" -ForegroundColor White
        Write-Host ""
        Write-Host "After installing Node.js, run install-windows.bat again." -ForegroundColor White
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""

# ── Install dependencies ──────────────────────────────────
Write-Host "Installing app dependencies (this may take a minute)..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "✓ Dependencies installed." -ForegroundColor Green
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host " Setup complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "To launch the app, double-click:  start-windows.bat"
Write-Host ""
Read-Host "Press Enter to exit"
