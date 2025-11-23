@echo off
echo Resetting PostgreSQL password...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "ALTER USER postgres WITH PASSWORD 'password';"
if %ERRORLEVEL% EQU 0 (
    echo Password reset successfully!
) else (
    echo Failed to reset password. You may need to enter your current password when prompted.
)
pause
