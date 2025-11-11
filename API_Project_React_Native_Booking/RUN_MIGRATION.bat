@echo off
echo ========================================
echo Migration Script for Image URLs
echo ========================================
echo.

set DB_NAME=api_project_react_native_booking
set DB_USER=root
set DB_PASSWORD=13012005

echo Step 1: Running migration.sql...
mysql -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < src\main\resources\migration.sql

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Migration failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Updating sample data...
mysql -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < src\main\resources\update-sample-data.sql

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Update sample data failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Migration completed successfully!
echo ========================================
echo.
echo Please verify the data by running:
echo   SELECT COUNT(*) FROM hotels WHERE image_url IS NOT NULL;
echo   SELECT COUNT(*) FROM users WHERE avatar_url IS NOT NULL;
echo.
pause

