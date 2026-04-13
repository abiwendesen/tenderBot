# Download Qdrant Windows binary for local run (no Docker)
$QdrantUrl = "https://github.com/qdrant/qdrant/releases/download/v1.17.0/qdrant-x86_64-pc-windows-msvc.zip"
$ParentDir = Split-Path $PSScriptRoot -Parent
$QdrantDir = Join-Path $ParentDir "qdrant-local"
$ZipPath = Join-Path $QdrantDir "qdrant.zip"
$ExePath = Join-Path $QdrantDir "qdrant.exe"

if (Test-Path $ExePath) {
  Write-Host "Qdrant already exists at $ExePath"
  exit 0
}

Write-Host "Downloading Qdrant for Windows..."
New-Item -ItemType Directory -Force -Path $QdrantDir | Out-Null

try {
  Invoke-WebRequest -Uri $QdrantUrl -OutFile $ZipPath -UseBasicParsing
  Expand-Archive -Path $ZipPath -DestinationPath $QdrantDir -Force
  Remove-Item $ZipPath -Force
  Write-Host "Qdrant installed at: $QdrantDir"
} catch {
  Write-Host "Download failed: $_"
  Write-Host "Manually download from: $QdrantUrl"
  exit 1
}
