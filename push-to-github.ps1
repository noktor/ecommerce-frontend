# Quick script to push code to GitHub
# Make sure you've created the repository at https://github.com/new first

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [string]$RepoName = "ecommerce-frontend"
)

$repoUrl = "https://github.com/$GitHubUsername/$RepoName.git"

Write-Host "🚀 Configuring remote and pushing changes..." -ForegroundColor Green
Write-Host "Repository: $repoUrl" -ForegroundColor Cyan

# Remove remote if it already exists
git remote remove origin 2>$null

# Add the remote
git remote add origin $repoUrl

# Push
Write-Host ""
Write-Host "📤 Pushing code to GitHub..." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All done! Repository is available at:" -ForegroundColor Green
    Write-Host "   https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Error pushing." -ForegroundColor Red
    Write-Host "Make sure that:" -ForegroundColor Yellow
    Write-Host "  1. You've created the repository on GitHub" -ForegroundColor Yellow
    Write-Host "  2. Your Git credentials are configured" -ForegroundColor Yellow
    Write-Host "  3. The username is correct" -ForegroundColor Yellow
}
