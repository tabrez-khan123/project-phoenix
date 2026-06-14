$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot
$python = "C:/Users/Mirza Zabiullah/AppData/Local/Programs/Python/Python311/python.exe"
& $python -m uvicorn backend.phoenix_backend:app --reload --port 8000
