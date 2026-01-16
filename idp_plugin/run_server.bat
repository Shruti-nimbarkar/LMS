@echo off
REM Windows batch script to start IDP test server from project root

echo Starting IDP Plugin Test Server...
echo.

REM Get the script directory and go to parent (project root)
cd /d "%~dp0\.."

REM Start the server
python idp_plugin\test_server.py

pause




