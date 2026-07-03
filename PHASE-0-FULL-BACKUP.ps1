$ErrorActionPreference = "Stop"

$DevRoot  = "D:\AI-ECOMMERCE"
$ProdRoot = "D:\AI-ECOMMERCE\AI-CommerceLIVE"
$AuditRoot = "D:\AI-ECOMMERCE\PROJECT_AUDIT"
$BackupRoot = Join-Path $AuditRoot "BACKUPS"

$Time = Get-Date -Format "yyyyMMdd-HHmmss"
$Phase = "PHASE-0-FULL-BACKUP"

New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null

$DevZip  = Join-Path $BackupRoot "DEV-FULL-BACKUP-$Time.zip"
$ProdZip = Join-Path $BackupRoot "PROD-FULL-BACKUP-$Time.zip"
$Report  = Join-Path $BackupRoot "$Phase-REPORT-$Time.txt"

$ExcludeNames = @(
  "node_modules",
  ".next",
  "dist",
  "build",
  ".turbo",
  ".cache",
  ".git",
  "logs",
  "coverage",
  "PROJECT_AUDIT"
)

function Copy-CleanProject {
  param(
    [string]$Source,
    [string]$Temp
  )

  New-Item -ItemType Directory -Force -Path $Temp | Out-Null

  Get-ChildItem -LiteralPath $Source -Force | Where-Object {
    $ExcludeNames -notcontains $_.Name
  } | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination $Temp -Recurse -Force
  }
}

function New-ProjectBackupZip {
  param(
    [string]$Source,
    [string]$ZipPath,
    [string]$Label
  )

  if (!(Test-Path $Source)) {
    throw "$Label path not found: $Source"
  }

  $Temp = Join-Path $env:TEMP ("AI-COMMERCE-BACKUP-" + [guid]::NewGuid())
  Copy-CleanProject -Source $Source -Temp $Temp

  Compress-Archive -Path (Join-Path $Temp "*") -DestinationPath $ZipPath -Force
  Remove-Item -LiteralPath $Temp -Recurse -Force

  $size = [math]::Round((Get-Item $ZipPath).Length / 1MB, 2)
  return "$Label BACKUP CREATED: $ZipPath | SIZE: $size MB"
}

$lines = @()
$lines += "AI-COMMERCE PHASE 0 FULL BACKUP"
$lines += "TIME: $Time"
$lines += "DEV ROOT: $DevRoot"
$lines += "PROD ROOT: $ProdRoot"
$lines += "BACKUP ROOT: $BackupRoot"
$lines += ""
$lines += "EXCLUDED:"
$lines += ($ExcludeNames -join ", ")
$lines += ""

Write-Host "Creating Development backup..."
$lines += New-ProjectBackupZip -Source $DevRoot -ZipPath $DevZip -Label "DEVELOPMENT"

Write-Host "Creating Production backup..."
$lines += New-ProjectBackupZip -Source $ProdRoot -ZipPath $ProdZip -Label "PRODUCTION"

$lines += ""
$lines += "STATUS: PASS"
$lines += "NEXT: PHASE 1 SECURITY EMERGENCY FIX"

$lines | Set-Content -Path $Report -Encoding UTF8

Write-Host ""
Write-Host "PHASE 0 BACKUP COMPLETE" -ForegroundColor Green
Write-Host "DEV ZIP : $DevZip"
Write-Host "PROD ZIP: $ProdZip"
Write-Host "REPORT  : $Report"