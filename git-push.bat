@echo off
echo ====================================
echo Git Commit and Push Script
echo ====================================
echo.

REM Check if we're in a git repository
git status >nul 2>&1
if errorlevel 1 (
    echo ERROR: Not a git repository!
    pause
    exit /b 1
)

REM Show current status
echo Current Status:
echo ----------------
git status --short
echo.

REM Ask for confirmation
set /p CONFIRM="Do you want to commit and push these changes? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Aborted.
    pause
    exit /b 0
)

REM Ask for commit message
echo.
set /p COMMIT_MSG="Enter commit message (or press Enter for default): "
if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=Update project files
)

echo.
echo ====================================
echo Committing and Pushing...
echo ====================================
echo.

REM Add all changes
echo Adding all changes...
git add .

REM Commit with message
echo Committing with message: "%COMMIT_MSG%"
git commit -m "%COMMIT_MSG%"

if errorlevel 1 (
    echo.
    echo No changes to commit or commit failed.
    pause
    exit /b 1
)

REM Push to GitHub
echo Pushing to GitHub...
git push origin main

if errorlevel 1 (
    echo.
    echo ERROR: Push failed! Check your internet connection or GitHub credentials.
    pause
    exit /b 1
)

echo.
echo ====================================
echo Successfully pushed to GitHub!
echo ====================================
echo Repository: https://github.com/GodJatin/get2gather_CEMS
echo.
pause
