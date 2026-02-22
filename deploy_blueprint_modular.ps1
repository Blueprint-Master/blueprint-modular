# Deploiement du site Blueprint Modular vers le VPS
# Usage: depuis le dossier blueprint-modular, executer .\deploy_blueprint_modular.ps1
# Prealable: dossier /var/www/blueprint-modular cree sur le serveur (voir DEPLOIEMENT_DOMAINE.md)

$ErrorActionPreference = "Stop"

$SSH_KEY = "$env:USERPROFILE\.ssh\portfolio_beam_key"
$SERVER_USER = "ubuntu"
$SERVER_IP = "145.239.199.236"
$REMOTE_PATH = "/var/www/blueprint-modular"

if (-not (Test-Path $SSH_KEY)) {
    Write-Host "[ERREUR] Cle SSH introuvable: $SSH_KEY" -ForegroundColor Red
    Write-Host "   Modifiez `$SSH_KEY dans ce script ou creez la cle." -ForegroundColor Yellow
    exit 1
}

# Fichiers statiques dans frontend/static/
$staticRoot = "frontend\static"
$files = @("index.html", "doc.css", "landing.css", "doc.js", "components.html", "reference.html", "cheat-sheet.html", "docs.html", "modules.html", "versions.html")
foreach ($f in $files) {
    if (-not (Test-Path (Join-Path $staticRoot $f))) {
        Write-Host "[ERREUR] Fichier manquant: $staticRoot\$f" -ForegroundColor Red
        exit 1
    }
}
if (Test-Path "Logo BPM.png") {
    Write-Host "Logo BPM.png (racine) sera copie." -ForegroundColor Gray
} elseif (-not (Test-Path (Join-Path $staticRoot "img"))) {
    Write-Host "[ATTENTION] Ni Logo BPM.png ni frontend\static\img - logos possibles manquants" -ForegroundColor Yellow
}

Write-Host "Deploiement Blueprint Modular vers $SERVER_USER@${SERVER_IP}:$REMOTE_PATH" -ForegroundColor Cyan
Write-Host ""

# Copie des fichiers (frontend/static -> racine distante, Logo a la racine)
$remote = "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}"
foreach ($f in $files) {
    $src = Join-Path $staticRoot $f
    Write-Host "Copie $f ..." -ForegroundColor Gray
    scp -i $SSH_KEY "$src" "${remote}/"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERREUR] Echec copie $f" -ForegroundColor Red
        exit 1
    }
}
if (Test-Path "Logo BPM.png") {
    Write-Host "Copie Logo BPM.png ..." -ForegroundColor Gray
    scp -i $SSH_KEY "Logo BPM.png" "${remote}/"
    if ($LASTEXITCODE -ne 0) { Write-Host "[ERREUR] Echec copie Logo" -ForegroundColor Red; exit 1 }
}
if (Test-Path (Join-Path $staticRoot "favicon.ico")) {
    scp -i $SSH_KEY (Join-Path $staticRoot "favicon.ico") "${remote}/"
    Write-Host "favicon.ico copie." -ForegroundColor Gray
} elseif (Test-Path "favicon.ico") {
    scp -i $SSH_KEY "favicon.ico" "${remote}/"
    Write-Host "favicon.ico (racine) copie." -ForegroundColor Gray
}
# manifest.json si present
if (Test-Path (Join-Path $staticRoot "manifest.json")) {
    scp -i $SSH_KEY (Join-Path $staticRoot "manifest.json") "${remote}/"
    Write-Host "manifest.json copie." -ForegroundColor Gray
}

# Copie des dossiers de la doc depuis frontend/static
$docDirs = @("get-started", "api-reference", "deploy", "knowledge-base", "modules", "img", "js", "i18n")
foreach ($dir in $docDirs) {
    $dirPath = Join-Path $staticRoot $dir
    if (Test-Path $dirPath) {
        Write-Host "Copie de $dirPath ..." -ForegroundColor Gray
        scp -i $SSH_KEY -r "${dirPath}" "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ATTENTION] Echec copie $dir" -ForegroundColor Yellow
        }
    }
}

Write-Host "[OK] Fichiers deployes." -ForegroundColor Green
Write-Host ""
Write-Host "Verification sur le serveur:" -ForegroundColor Cyan
ssh -i $SSH_KEY "${SERVER_USER}@${SERVER_IP}" "ls -la $REMOTE_PATH"
Write-Host ""
Write-Host "Site disponible (apres config Nginx + SSL): https://VOTRE_DOMAINE.fr" -ForegroundColor Cyan
Write-Host "Si le logo ne s'affiche pas (403): sur le serveur, executer les commandes chmod de deploy/PERMISSIONS-403.md" -ForegroundColor Yellow
