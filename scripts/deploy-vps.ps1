# Deploiement sur le VPS (ou en local avec Docker). A lancer depuis la racine du projet.
# Usage: .\scripts\deploy-vps.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $ProjectRoot

if (-not (Test-Path ".env")) {
    Write-Host "Fichier .env manquant. Copie de .env.example vers .env."
    Copy-Item ".env.example" ".env"
    Write-Host "Edite .env (POSTGRES_PASSWORD, NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_*) puis relance ce script."
    exit 1
}

Write-Host "Build et demarrage des conteneurs..."
docker-compose up -d --build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Attente du demarrage de PostgreSQL (15 s)..."
Start-Sleep -Seconds 15

Write-Host "Application des migrations Prisma..."
docker-compose --profile tools run --rm migrate
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Deploiement termine. App sur le port 3000."
Write-Host "Pense a mettre Nginx (ou autre) en reverse proxy et a configurer NEXTAUTH_URL + callback Google."
