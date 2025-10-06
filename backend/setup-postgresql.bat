@echo off
echo ========================================
echo  AI Study Assistant - PostgreSQL Setup
echo ========================================
echo.

echo [1/5] Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully
echo.

echo [2/5] Checking PostgreSQL connection...
echo Make sure PostgreSQL is running and you have:
echo - Database: ai_study_assistant
echo - User credentials configured in .env file
echo.
pause

echo [3/5] Running database migration...
call npm run migrate
if %errorlevel% neq 0 (
    echo Error: Database migration failed
    echo Please check your PostgreSQL connection and .env configuration
    pause
    exit /b 1
)
echo ✅ Database migration completed
echo.

echo [4/5] Testing PostgreSQL setup...
call npm run test-pg
if %errorlevel% neq 0 (
    echo Warning: Some tests failed, but you can continue
    echo.
)

echo [5/5] Setup completed!
echo.
echo ========================================
echo  Ready to start the server!
echo ========================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo Your API will be available at:
echo   http://localhost:5000
echo.
echo Health check endpoint:
echo   http://localhost:5000/api/health
echo.
pause