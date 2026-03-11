@echo off
title Jira Ticket Organizer
echo.
echo =====================================
echo  Jira Ticket Organizer
echo =====================================
echo.
echo Starting server at http://localhost:3000
echo Your browser will open automatically.
echo.
echo Close this window to stop the server.
echo.

cd /d "%~dp0"

:: Open browser after server has had a moment to start
start /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

npm start
