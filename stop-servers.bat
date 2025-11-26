@echo off
echo ====================================
echo Stopping Get2Gather Project Servers
echo ====================================
echo.

REM Stop process on port 3000 (Frontend - Next.js)
echo Checking for process on port 3000 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Killing process %%a on port 3000
    taskkill /F /PID %%a
)

REM Stop process on port 8000 (Backend - FastAPI)
echo Checking for process on port 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    echo Killing process %%a on port 8000
    taskkill /F /PID %%a
)

REM Stop any uvicorn processes
echo Checking for uvicorn processes...
taskkill /F /IM "python.exe" /FI "WINDOWTITLE eq *uvicorn*" 2>nul

REM Stop any node processes related to Next.js
echo Checking for Next.js processes...
taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq *next*" 2>nul

echo.
echo ====================================
echo All servers stopped!
echo ====================================
pause
