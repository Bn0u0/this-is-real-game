@echo off
echo Starting Art Lab Sandbox...
echo.
echo [INFO] Opening Browser at http://localhost:5173/lab.html
echo.

start http://localhost:5173/lab.html

echo [INFO] Ensuring Server is Running...
cd app
npm run dev
pause
