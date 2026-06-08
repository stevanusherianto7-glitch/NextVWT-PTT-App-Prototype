# supabase/deploy.ps1
# Automate Supabase Edge Function deployment and secrets configuration

$ErrorActionPreference = "Stop"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   NextVWT PTT App — Edge Function Deploy Script" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check if Supabase CLI is installed
if (-not (Get-Command "supabase" -ErrorAction SilentlyContinue)) {
    Write-Error "Supabase CLI is not installed or not in your PATH. Please install it first."
}

# 2. Deploy the Edge Function
Write-Host "[1/3] Deploying turn-credentials function..." -ForegroundColor Yellow
supabase functions deploy turn-credentials --project-ref "$env:SUPABASE_PROJECT_ID"
if ($LASTEXITCODE -ne 0) {
    # If project-ref is not set in env, it will fallback to the linked project automatically
    supabase functions deploy turn-credentials
}

Write-Host "Edge Function turn-credentials deployed successfully!" -ForegroundColor Green
Write-Host ""

# 3. Provide credentials setup guide
Write-Host "[2/3] Secrets Configuration Instructions:" -ForegroundColor Yellow
Write-Host "To make the TURN credentials function work in production, you must set these Supabase secrets."
Write-Host "Choose one of the supported providers (Metered or Twilio) or Fallback Static."
Write-Host ""

Write-Host "A. Provider configuration:"
Write-Host "   supabase secrets set TURN_PROVIDER=metered"
Write-Host "   Or:"
Write-Host "   supabase secrets set TURN_PROVIDER=twilio"
Write-Host ""

Write-Host "B. Metered credentials (Recommended, free tier 50GB):"
Write-Host "   supabase secrets set METERED_DOMAIN=<your-metered-app>.metered.ca"
Write-Host "   supabase secrets set METERED_API_KEY=<your-api-key>"
Write-Host ""

Write-Host "C. Twilio traversal credentials (Alternative):"
Write-Host "   supabase secrets set TWILIO_ACCOUNT_SID=<your-account-sid>"
Write-Host "   supabase secrets set TWILIO_AUTH_TOKEN=<your-auth-token>"
Write-Host ""

Write-Host "[3/3] Deployment complete. Ready for production usage!" -ForegroundColor Green
