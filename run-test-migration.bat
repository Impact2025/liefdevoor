@echo off
echo 🚀 Starting Migration Test with 100 Users
echo ==========================================
echo.

echo 📋 Prerequisites Check:
echo   - Node.js installed: 
node --version
echo   - Dependencies installed:
call npm list --depth=0 | findstr "mysql2 @prisma/client @faker-js/faker"
echo.

echo 🧪 Setting up test environment...
echo.

echo 📊 Starting test migration...
node test-migration.js

echo.
echo 🎯 Test completed!
echo 📋 Check results:
echo   - migration-status.json for detailed report
echo   - Run: node migration-monitor.js report
echo   - View dashboard: http://localhost:3001
echo.

pause