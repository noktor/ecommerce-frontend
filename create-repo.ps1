# Script to create repository on GitHub and push changes
# Requires a GitHub Personal Access Token

param(
    [string]$RepoName = "ecommerce-frontend",
    [string]$Description = "E-commerce frontend built with React, TypeScript, and Vite",
    [string]$Visibility = "public",
    [string]$GitHubToken = $env:GITHUB_TOKEN
)

if (-not $GitHubToken) {
    Write-Host "❌ GITHUB_TOKEN not found in environment variables." -ForegroundColor Red
    Write-Host ""
    Write-Host "To create the repository automatically, you need a Personal Access Token:" -ForegroundColor Yellow
    Write-Host "1. Go to https://github.com/settings/tokens" -ForegroundColor Cyan
    Write-Host "2. Create a new token with 'repo' permissions" -ForegroundColor Cyan
    Write-Host "3. Run: `$env:GITHUB_TOKEN='your_token'; .\create-repo.ps1`" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or create the repository manually at https://github.com/new and then run:" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/$RepoName.git" -ForegroundColor Cyan
    Write-Host "  git push -u origin main" -ForegroundColor Cyan
    exit 1
}

Write-Host "🚀 Creating repository on GitHub..." -ForegroundColor Green

# Detect GitHub user
$headers = @{
    "Authorization" = "token $GitHubToken"
    "Accept" = "application/vnd.github.v3+json"
}

try {
    $userResponse = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
    $username = $userResponse.login
    Write-Host "✅ User detected: $username" -ForegroundColor Green
} catch {
    Write-Host "❌ Error authenticating with GitHub. Verify the token." -ForegroundColor Red
    exit 1
}

# Create the repository
$body = @{
    name = $RepoName
    description = $Description
    private = ($Visibility -eq "private")
    auto_init = $false
} | ConvertTo-Json

try {
    $repoResponse = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "✅ Repository created: $($repoResponse.html_url)" -ForegroundColor Green
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorDetails.message -like "*already exists*") {
        Write-Host "⚠️  Repository already exists. Continuing with push..." -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error creating repository: $($errorDetails.message)" -ForegroundColor Red
        exit 1
    }
}

# Configure remote and push
Write-Host ""
Write-Host "📤 Configuring remote and pushing changes..." -ForegroundColor Green

# Remove remote if it already exists
git remote remove origin 2>$null

# Add the remote
$repoUrl = "https://github.com/$username/$RepoName.git"
git remote add origin $repoUrl

# Push
Write-Host "Pushing to $repoUrl..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All done! Repository is available at:" -ForegroundColor Green
    Write-Host "   https://github.com/$username/$RepoName" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Error pushing. Verify Git credentials." -ForegroundColor Red
    Write-Host "   You can push manually with: git push -u origin main" -ForegroundColor Yellow
}

