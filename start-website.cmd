@echo off
cd /d "%~dp0"
echo Starting BaloWaci website on http://localhost:8000
echo Leave this window open while using the website.
node static-server.js
pause
