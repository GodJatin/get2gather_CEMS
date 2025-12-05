@echo off
echo ====================================
echo Starting Get2Gather Project
echo ====================================
echo.

REM Check if in correct directory
if not exist "frontend\backend" (
    echo ERROR: frontend\backend folder not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ERROR: frontend folder not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

REM Start Backend
echo Starting Backend Server (Port 8000)...
start "Get2Gather Backend" cmd /k "cd frontend/backend && .\venv_new\Scripts\activate && uvicorn main:app --reload"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend
echo Starting Frontend Server (Port 3000)...
start "Get2Gather Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ====================================
echo Servers Starting...
echo ====================================
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit this window...
echo (Servers will continue running in separate windows)
pause >nul
