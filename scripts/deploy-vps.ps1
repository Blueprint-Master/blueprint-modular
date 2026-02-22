# Deploiement sur le VPS (ou en local avec Docker). A lancer depuis la racine du projet.
# Usage: .\scripts\deploy-vps.ps1
# Prerequis: Docker Desktop (Windows) ou Docker + docker-compose (Linux)

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $ProjectRoot

if (-not (Test-Path ".env")) {
    Write-Host "Fichier .env manquant. Copie de .env.example vers .env."
    Copy-Item ".env.example" ".env"
    Write-Host "Edite .env (POSTGRES_PASSWORD, NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_*) puis relance ce script."
    exit 1
}

# Docker Desktop (Windows) : "docker compose". Ancien / Linux : "docker-compose"
$dc = "docker-compose"
if (Get-Command docker -ErrorAction SilentlyContinue) {
    try { $null = & docker compose version 2>&1 } catch { }
    if ($LASTEXITCODE -eq 0) { $dc = "docker compose" }
}
if ($dc -eq "docker-compose" -and -not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        $dc = "docker compose"
    } else {
        Write-Host "Docker n'est pas installe ou pas dans le PATH."
        Write-Host "Installe Docker Desktop (Windows): https://www.docker.com/products/docker-desktop/"
        Write-Host "Puis redemarre PowerShell et relance ce script."
        exit 1
    }
}

Write-Host "Build et demarrage des conteneurs (commande: $dc)..."
if ($dc -eq "docker compose") {
    & docker compose up -d --build
} else {
    & docker-compose up -d --build
}
if ($LASTEXITCODE -ne 0) {
    Write-Host "Echec. Verifie que Docker Desktop est demarre (icone dans la barre des taches)."
    exit 1
}

Write-Host "Attente du demarrage de PostgreSQL (15 s)..."
Start-Sleep -Seconds 15

Write-Host "Application des migrations Prisma..."
if ($dc -eq "docker compose") {
    & docker compose --profile tools run --rm migrate
} else {
    & docker-compose --profile tools run --rm migrate
}
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Deploiement termine. App sur le port 3000."
Write-Host "Pense a mettre Nginx (ou autre) en reverse proxy et a configurer NEXTAUTH_URL + callback Google."
