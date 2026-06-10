# Deploiement COMPLET du site Blueprint Modular (app + static) vers le VPS
# Usage: .\deploy_blueprint_modular_full.ps1
# Prealable: sur le serveur, avoir execute deploy/setup.sh une fois (venv, systemd).
# Serveur: unzip installe (apt install unzip).

$ErrorActionPreference = "Stop"

# Infra fournie via variables d'environnement (voir .env.example). Aucune valeur reelle en dur.
$SSH_KEY = if ($env:VPS_SSH_KEY) { $env:VPS_SSH_KEY } else { "$env:USERPROFILE\.ssh\<ssh-key-name>" }
$SERVER_USER = if ($env:VPS_USER) { $env:VPS_USER } else { "<vps-user>" }
$SERVER_IP = if ($env:VPS_HOST) { $env:VPS_HOST } else { "<vps-host>" }
$REMOTE_PATH = if ($env:VPS_REMOTE_PATH) { $env:VPS_REMOTE_PATH } else { "/var/www/blueprint-modular" }

if (-not (Test-Path $SSH_KEY)) {
    Write-Host "[ERREUR] Cle SSH introuvable: $SSH_KEY" -ForegroundColor Red
    exit 1
}

$exclude = @(".git", "venv", "__pycache__", ".env", "node_modules", ".cursor")
$rsyncExclude = ($exclude | ForEach-Object { "--exclude=$_" }) -join " "

Write-Host "Deploiement COMPLET vers $SERVER_USER@${SERVER_IP}:$REMOTE_PATH" -ForegroundColor Cyan

# Avec scp recursif: copier les dossiers et fichiers necessaires
$items = @(
    "app.py", "requirements.txt", ".env.example",
    "index.html", "doc.css", "cheat-sheet.html", "components.html", "reference.html",
    "Logo BPM.png", "Logo-BPM-nom.jpg", "Logo-BPM-seul.png",
    "get-started", "api-reference", "knowledge-base", "deploy", "pages"
)
$allExist = $true
foreach ($i in $items) {
    if (-not (Test-Path $i)) {
        Write-Host "[ATTENTION] Manquant: $i" -ForegroundColor Yellow
        if ($i -notmatch "\.(html|css|py|png|jpg|example)$" -and -not (Test-Path $i)) { $allExist = $false }
    }
}

if (Test-Path "favicon.ico") { $items += "favicon.ico" }

# Creer une archive et la copier (plus fiable que scp -r sous Windows)
$archive = "bpm-deploy.zip"
$toZip = @("app.py", "requirements.txt", ".env.example", "index.html", "doc.css", "cheat-sheet.html",
    "components.html", "reference.html", "Logo BPM.png", "Logo-BPM-nom.jpg", "Logo-BPM-seul.png",
    "get-started", "api-reference", "knowledge-base", "deploy", "pages")
Remove-Item $archive -ErrorAction SilentlyContinue
Compress-Archive -Path $toZip -DestinationPath $archive -Force

scp -i $SSH_KEY $archive "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERREUR] Echec scp" -ForegroundColor Red
    Remove-Item $archive -ErrorAction SilentlyContinue
    exit 1
}

# Sur le serveur: extraire et mettre a jour
$remoteCmd = "cd $REMOTE_PATH && unzip -o -q $archive && rm $archive && (test -f deploy/update.sh && bash deploy/update.sh || true)"
ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" $remoteCmd

Remove-Item $archive -ErrorAction SilentlyContinue
Write-Host "[OK] Deploiement complet termine." -ForegroundColor Green
Write-Host "Service app: systemctl status blueprint-modular (sur le serveur)" -ForegroundColor Cyan
