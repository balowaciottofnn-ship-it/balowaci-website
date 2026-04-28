@echo off
cd /d "%~dp0backend"
echo Starting BaloWaci backend on http://localhost:5000
echo Leave this window open while using the website.
node src/server.js
pause
