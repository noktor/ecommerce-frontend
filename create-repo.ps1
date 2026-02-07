# Script per crear el repositori a GitHub i pujar els canvis
# Requereix un Personal Access Token de GitHub

param(
    [string]$RepoName = "ecommerce-frontend",
    [string]$Description = "E-commerce frontend built with React, TypeScript, and Vite",
    [string]$Visibility = "public",
    [string]$GitHubToken = $env:GITHUB_TOKEN
)

if (-not $GitHubToken) {
    Write-Host "❌ No s'ha trobat GITHUB_TOKEN a les variables d'entorn." -ForegroundColor Red
    Write-Host ""
    Write-Host "Per crear el repositori automàticament, necessites un Personal Access Token:" -ForegroundColor Yellow
    Write-Host "1. Ves a https://github.com/settings/tokens" -ForegroundColor Cyan
    Write-Host "2. Crea un nou token amb permisos 'repo'" -ForegroundColor Cyan
    Write-Host "3. Executa: `$env:GITHUB_TOKEN='el_teu_token'; .\create-repo.ps1`" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "O crea el repositori manualment a https://github.com/new i després executa:" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/TU_USUARI/$RepoName.git" -ForegroundColor Cyan
    Write-Host "  git push -u origin main" -ForegroundColor Cyan
    exit 1
}

Write-Host "🚀 Creant repositori a GitHub..." -ForegroundColor Green

# Detectar l'usuari de GitHub
$headers = @{
    "Authorization" = "token $GitHubToken"
    "Accept" = "application/vnd.github.v3+json"
}

try {
    $userResponse = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
    $username = $userResponse.login
    Write-Host "✅ Usuari detectat: $username" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al autenticar amb GitHub. Verifica el token." -ForegroundColor Red
    exit 1
}

# Crear el repositori
$body = @{
    name = $RepoName
    description = $Description
    private = ($Visibility -eq "private")
    auto_init = $false
} | ConvertTo-Json

try {
    $repoResponse = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "✅ Repositori creat: $($repoResponse.html_url)" -ForegroundColor Green
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorDetails.message -like "*already exists*") {
        Write-Host "⚠️  El repositori ja existeix. Continuant amb el push..." -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error al crear el repositori: $($errorDetails.message)" -ForegroundColor Red
        exit 1
    }
}

# Configurar el remote i fer push
Write-Host ""
Write-Host "📤 Configurant remote i pujant canvis..." -ForegroundColor Green

# Eliminar remote si ja existeix
git remote remove origin 2>$null

# Afegir el remote
$repoUrl = "https://github.com/$username/$RepoName.git"
git remote add origin $repoUrl

# Fer push
Write-Host "Pujant a $repoUrl..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Tot fet! El repositori està disponible a:" -ForegroundColor Green
    Write-Host "   https://github.com/$username/$RepoName" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Error al fer push. Verifica les credencials de Git." -ForegroundColor Red
    Write-Host "   Pots fer push manualment amb: git push -u origin main" -ForegroundColor Yellow
}

