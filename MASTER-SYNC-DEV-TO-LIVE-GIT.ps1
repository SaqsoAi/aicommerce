$DEV  = "D:\AI-ECOMMERCE"
$PROD = "D:\AI-ECOMMERCE\AI-CommerceLIVE"

$OUT = "$PROD\SYNC_REPORT-" + (Get-Date -Format "yyyyMMdd-HHmmss")
New-Item -ItemType Directory -Force $OUT | Out-Null

Write-Host "SYNC START: DEV -> LIVE"

$CommonArgs = @(
  "/E",
  "/COPY:DAT",
  "/R:2",
  "/W:2",
  "/XD",
  "node_modules", ".next", "dist", "build", "coverage", ".git", ".turbo", ".cache", ".vscode", "logs", "tmp", "temp",
  "/XF",
  "*.log", "*.tmp", "*.bak", "*.zip"
)

robocopy "$DEV\server" "$PROD\server" @CommonArgs /LOG:"$OUT\server-sync.txt"
robocopy "$DEV\admin"  "$PROD\admin"  @CommonArgs /LOG:"$OUT\admin-sync.txt"
robocopy "$DEV\client" "$PROD\client" @CommonArgs /LOG:"$OUT\client-sync.txt"

cd $PROD

Write-Host "Checking dangerous deletions..."
git status --short | Tee-Object "$OUT\git-status-before.txt"

$Deleted = git status --short | Where-Object { $_ -match "^\s*D\s+" }
if ($Deleted) {
  Write-Host "STOP: Deleted files detected. Not committing."
  $Deleted | Tee-Object "$OUT\deleted-files-blocked.txt"
  exit 1
}

Write-Host "Checking conflict markers..."
git grep "<<<<<<<" -- server admin client | Tee-Object "$OUT\conflict-head.txt"
git grep ">>>>>>>" -- server admin client | Tee-Object "$OUT\conflict-tail.txt"

if ((Get-Content "$OUT\conflict-head.txt" -ErrorAction SilentlyContinue) -or (Get-Content "$OUT\conflict-tail.txt" -ErrorAction SilentlyContinue)) {
  Write-Host "STOP: Conflict markers found. Not committing."
  exit 1
}

Write-Host "Git add only server/admin/client..."
git add server admin client

Write-Host "Force adding uploads..."
git add -f server/uploads

git status --short | Tee-Object "$OUT\git-status-after-add.txt"

$HasChanges = git status --short
if (-not $HasChanges) {
  Write-Host "No changes to commit."
  exit 0
}

git commit -m "sync: development to production"
git push origin main

Write-Host "DONE: Sync + Git Push complete."
Write-Host "Report: $OUT"