@echo off
REM Windows batch script to start IDP test server

echo Starting IDP Plugin Test Server...
echo.

REM Check if .env exists
if not exist .env (
    echo Warning: .env file not found!
    echo Please create .env file with required configuration.
    echo.
)

REM Start the server
python idp_plugin/test_server.py

pause





