# Run Qdrant (keep this terminal open)
$ParentDir = Split-Path $PSScriptRoot -Parent
$QdrantDir = Join-Path $ParentDir "qdrant-local"
$ExePath = Join-Path $QdrantDir "qdrant.exe"

if (-not (Test-Path $ExePath)) {
  Write-Host "Qdrant not found. Run: npm run qdrant"
  exit 1
}

Set-Location $QdrantDir
& .\qdrant.exe
