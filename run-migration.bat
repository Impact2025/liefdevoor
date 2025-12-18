@echo off
REM Professional Migration Runner for Windows
REM Usage: run-migration.bat

echo 🚀 Starting Professional Data Migration
echo ======================================

REM Check if .env.mysql exists
if not exist ".env.mysql" (
    echo ❌ Error: .env.mysql file not found!
    echo 📝 Please create .env.mysql from .env.mysql.example
    echo    copy .env.mysql.example .env.mysql
    echo    notepad .env.mysql
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Backup current database
echo 💾 Creating database backup...
if exist "prisma\dev.db" (
    copy "prisma\dev.db" "prisma\dev.db.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%" >nul 2>&1
    echo ✅ Database backup created
) else (
    echo ⚠️  No existing database to backup
)

REM Run the migration
echo 🔄 Running migration...
node migrate-data.js

REM Check exit code
if %errorlevel% equ 0 (
    echo.
    echo 🎉 Migration completed successfully!
    echo 📋 Next steps:
    echo    1. Run: npx prisma studio
    echo    2. Verify data in the application
    echo    3. Test user login and profiles
) else (
    echo.
    echo 💥 Migration failed!
    echo 🔍 Check the error messages above
    echo 🛠️  Troubleshooting:
    echo    - Verify MySQL credentials in .env.mysql
    echo    - Ensure MySQL server is running
    echo    - Check PostgreSQL DATABASE_URL
)

echo.
echo Press any key to continue...
pause >nul