@echo off
echo Starting Lab Recommendation Engine UI...
echo.
cd /d %~dp0
call lenv\Scripts\activate.bat
streamlit run ui/app.py
pause

