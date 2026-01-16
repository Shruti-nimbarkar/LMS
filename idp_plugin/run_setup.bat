@echo off
REM Windows batch script to run database setup from project root

echo Setting up IDP database...
echo.

REM Get the script directory and go to parent (project root)
cd /d "%~dp0\.."

REM Run setup
python idp_plugin\setup_database.py

pause




