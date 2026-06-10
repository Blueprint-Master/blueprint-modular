# Deploiement sur le VPS depuis Windows.
# Prerequis : repo clone sur le VPS dans /home/<vps-user>/blueprint-modular (ou VPS_REMOTE_DIR).
# Usage: .\scripts\deploy-vps-remote.ps1
# Nouveau serveur : .\scripts\deploy-vps-remote.ps1 -VpsHost NOUVELLE_IP
# Ou : $env:VPS_HOST = "NOUVELLE_IP"; .\scripts\deploy-vps-remote.ps1
# Redéploiement complet (transfert, CSS, code) : voir deploy/REDEPLOY-NEW-SERVER.md

param(
    [string]$VpsHost = $env:VPS_HOST,
    [string]$User = $env:VPS_USER,
    [string]$KeyPath = $env:VPS_SSH_KEY,
    [string]$RemoteDir = $env:VPS_REMOTE_DIR
)

# Valeurs par defaut (placeholders : fournir les vraies valeurs via $env:VPS_* ou les parametres)
if (-not $VpsHost) { $VpsHost = "<vps-host>" }
if (-not $User) { $User = "<vps-user>" }
if (-not $RemoteDir) { $RemoteDir = "/home/<vps-user>/blueprint-modular" }
$SshDir = Join-Path $env:USERPROFILE ".ssh"
if (-not $KeyPath) {
    $candidates = @(
        (Join-Path $SshDir "id_ed25519"),
        (Join-Path $SshDir "id_rsa")
    )
    foreach ($k in $candidates) {
        if (Test-Path $k) { $KeyPath = $k; break }
    }
}

$SshArgs = @()
if ($KeyPath -and (Test-Path $KeyPath)) { $SshArgs += "-i", $KeyPath }
$SshTarget = "${User}@${VpsHost}"

# Une seule commande : mise a jour repo + deploy-from-git.sh (vitrine + doc + app Next.js)
$Cmd = "cd $RemoteDir && git fetch origin && git reset --hard origin/master && chmod +x deploy/deploy-from-git.sh && bash deploy/deploy-from-git.sh"

Write-Host "Connexion a $SshTarget et deploiement (vitrine + doc + app)..."
& ssh @SshArgs $SshTarget $Cmd
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Deploiement termine."
