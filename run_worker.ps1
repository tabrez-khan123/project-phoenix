$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot
$python = "C:/Users/Mirza Zabiullah/AppData/Local/Programs/Python/Python311/python.exe"
& $python -m celery -A celery_worker worker --loglevel=info --concurrency=2
