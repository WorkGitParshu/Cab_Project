@echo off
echo.
echo ========================================
echo Stopping all npm processes...
echo ========================================
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak

echo.
echo ========================================
echo Clearing cache...
echo ========================================
rmdir /s /q node_modules\.vite 2>nul

echo.
echo ========================================
echo Restarting development server...
echo ========================================
npm run dev

echo.
echo ========================================
echo Server started on http://localhost:5173
echo ========================================
