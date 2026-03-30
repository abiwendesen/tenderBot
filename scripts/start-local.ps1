# Run tenderBot locally (Qdrant + Node app)
# Step 1: Start Qdrant. Step 2: Start the bot (in same process after Qdrant ready)
$ProjectRoot = (Get-Item $PSScriptRoot).Parent.FullName
$QdrantDir = Join-Path $ProjectRoot "qdrant-local"
$QdrantExe = Join-Path $QdrantDir "qdrant.exe"

# Ensure Qdrant is downloaded
if (-not (Test-Path $QdrantExe)) {
  Write-Host "Downloading Qdrant..."
  & "$PSScriptRoot\download-qdrant.ps1"
  if ($LASTEXITCODE -ne 0) { exit 1 }
}

# Start Qdrant in a new window (keeps running)
Write-Host "Starting Qdrant in new window (keep it open)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$QdrantDir'; .\qdrant.exe"

Write-Host "Waiting for Qdrant to be ready..."
Start-Sleep -Seconds 5

# Verify Qdrant is up
try {
  $r = Invoke-WebRequest -Uri "http://127.0.0.1:6333/collections" -UseBasicParsing -TimeoutSec 5
  if ($r.StatusCode -ne 200) { throw "Unexpected status" }
} catch {
  Write-Host "Qdrant may not be ready. Start it manually: cd qdrant-local && .\qdrant.exe"
  Write-Host "Then run: npm start"
  exit 1
}

Write-Host "Qdrant is ready. Starting tenderBot..."
Set-Location $ProjectRoot
npm start
