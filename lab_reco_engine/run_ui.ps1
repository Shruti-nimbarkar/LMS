# PowerShell script to run Streamlit UI
Write-Host "Starting Lab Recommendation Engine UI..." -ForegroundColor Green
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

& ".\lenv\Scripts\Activate.ps1"
streamlit run ui/app.py

