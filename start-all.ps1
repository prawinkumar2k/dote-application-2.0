# PowerShell Startup Script for DOTE Application# PowerShell Startup Script for DOTE Application






































































Get-Job | Wait-Job# Keep runningWrite-Host ""Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor YellowWrite-Host ""Write-Host "  GET    /api/student/me (protected)" -ForegroundColor GrayWrite-Host "  GET    /api/colleges/list" -ForegroundColor GrayWrite-Host "  GET    /api/master (dropdowns)" -ForegroundColor GrayWrite-Host "  POST   /api/auth/login" -ForegroundColor GrayWrite-Host "🔗 API Endpoints:" -ForegroundColor YellowWrite-Host ""Write-Host "  Pass:  Student@123" -ForegroundColor GrayWrite-Host "  Email: aman.kumar@email.com" -ForegroundColor GrayWrite-Host "📱 Test Student Login:" -ForegroundColor YellowWrite-Host ""Write-Host "Frontend: http://localhost:5173" -ForegroundColor CyanWrite-Host "Backend:  http://localhost:5000" -ForegroundColor CyanWrite-Host ""Write-Host "========================================" -ForegroundColor BlueWrite-Host " ✅ Both servers started!" -ForegroundColor GreenWrite-Host "`n========================================" -ForegroundColor Blue# SummaryStart-Sleep -Seconds 5$frontendJob = Start-Job -ScriptBlock { npm run dev }Set-Location "..\client"Write-Host "`n🌐 Starting frontend server on port 5173..." -ForegroundColor Green# Start FrontendStart-Sleep -Seconds 5$backendJob = Start-Job -ScriptBlock { npm start }Set-Location ".\server"Write-Host "`n📦 Starting backend server on port 5000..." -ForegroundColor Green# Start BackendWrite-Host $dbTest" 2>&1})();  }    console.log('❌ Failed: ' + e.message);  } catch (e) {    await conn.end();    console.log('✅ Connected');    });      database: 'admission_dote'      password: 'Test@12345',      user: 'ems_navicat',      port: 3306,      host: '88.222.244.171',    const conn = await mysql.createConnection({  try {(async () => {const mysql = require('mysql2/promise');$dbTest = node -e "Write-Host "`n📊 Testing database connection..." -ForegroundColor Cyan# Check database connectionStart-Sleep -Seconds 2Get-Process node -ErrorAction SilentlyContinue | Stop-Process -ForceWrite-Host "`n🔴 Killing old Node processes..." -ForegroundColor Yellow# Kill old processesWrite-Host "========================================" -ForegroundColor BlueWrite-Host " 🚀 DOTE Application Startup" -ForegroundColor BlueWrite-Host "========================================" -ForegroundColor Blue# Run as: powershell -ExecutionPolicy Bypass -File start-all.ps1# Run as: powershell -ExecutionPolicy Bypass -File start-all.ps1

Write-Host "========================================" -ForegroundColor Blue
Write-Host " 🚀 DOTE Application Startup" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue

# Kill old processes
Write-Host "`n🔴 Killing old Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Check database connection
Write-Host "`n📊 Testing database connection..." -ForegroundColor Cyan
$dbTest = node -e "
const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({
      host: '88.222.244.171',
      port: 3306,
      user: 'ems_navicat',
      password: 'Test@12345',
      database: 'admission_dote'
    });
    console.log('✅ Connected');
    await conn.end();
  } catch (e) {
    console.log('❌ Failed: ' + e.message);
  }
})();
" 2>&1

Write-Host $dbTest

# Start Backend
Write-Host "`n📦 Starting backend server on port 5000..." -ForegroundColor Green
Set-Location ".\server"
$backendJob = Start-Job -ScriptBlock { npm start }
Start-Sleep -Seconds 5

# Start Frontend
Write-Host "`n🌐 Starting frontend server on port 5173..." -ForegroundColor Green
Set-Location "..\client"
$frontendJob = Start-Job -ScriptBlock { npm run dev }
Start-Sleep -Seconds 5

# Summary
Write-Host "`n========================================" -ForegroundColor Blue
Write-Host " ✅ Both servers started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Test Student Login:" -ForegroundColor Yellow
Write-Host "  Email: aman.kumar@email.com" -ForegroundColor Gray
Write-Host "  Pass:  Student@123" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 API Endpoints:" -ForegroundColor Yellow
Write-Host "  POST   /api/auth/login" -ForegroundColor Gray
Write-Host "  GET    /api/master (dropdowns)" -ForegroundColor Gray
Write-Host "  GET    /api/colleges/list" -ForegroundColor Gray
Write-Host "  GET    /api/student/me (protected)" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Keep running
Get-Job | Wait-Job
