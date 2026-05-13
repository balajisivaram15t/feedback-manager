# Azure Container Apps Deployment Script
# Run this from the backend directory

# ============================================
# CONFIGURATION - UPDATE THESE VALUES
# ============================================
$resourceGroup = "rg-feedback-mgr"  # Your Azure resource group
$location = "eastus2"  # Same as your Foundry or any region
$containerAppEnv = "feedback-manager-env"
$containerAppName = "feedback-manager-app"
$acrName = "feedbackmanageracr123"  # Must be globally unique, lowercase, no hyphens

# Azure OpenAI Configuration
$azureOpenAIEndpoint = "https://testaimodel-sbal.services.ai.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2024-10-21"
$azureOpenAIModel = "gpt-4.1"

Write-Host "🚀 Starting Azure Container Apps Deployment..." -ForegroundColor Cyan

# ============================================
# STEP 1: Create Azure Container Registry
# ============================================
Write-Host "`n📦 Step 1: Creating Azure Container Registry..." -ForegroundColor Yellow

az acr create `
  --name $acrName `
  --resource-group $resourceGroup `
  --location $location `
  --sku Basic `
  --admin-enabled true

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create ACR. Please check the error above." -ForegroundColor Red
    exit 1
}

# Get ACR credentials
$acrUsername = az acr credential show --name $acrName --query username -o tsv
$acrPassword = az acr credential show --name $acrName --query "passwords[0].value" -o tsv
$acrLoginServer = az acr show --name $acrName --query loginServer -o tsv

Write-Host "✅ ACR created: $acrLoginServer" -ForegroundColor Green

# ============================================
# STEP 2: Build and Push Docker Image
# ============================================
Write-Host "`n🐳 Step 2: Building and pushing Docker image..." -ForegroundColor Yellow

# Login to ACR
az acr login --name $acrName

# Build and push using ACR build (no local Docker needed!)
az acr build `
  --registry $acrName `
  --image feedback-manager:latest `
  --file Dockerfile `
  .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build/push image. Please check the error above." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Image built and pushed successfully!" -ForegroundColor Green

# ============================================
# STEP 3: Create Container Apps Environment
# ============================================
Write-Host "`n🌐 Step 3: Creating Container Apps Environment..." -ForegroundColor Yellow

az containerapp env create `
  --name $containerAppEnv `
  --resource-group $resourceGroup `
  --location $location

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create Container Apps Environment." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Container Apps Environment created!" -ForegroundColor Green

# ============================================
# STEP 4: Create Container App with Managed Identity
# ============================================
Write-Host "`n📱 Step 4: Creating Container App..." -ForegroundColor Yellow

az containerapp create `
  --name $containerAppName `
  --resource-group $resourceGroup `
  --environment $containerAppEnv `
  --image "$acrLoginServer/feedback-manager:latest" `
  --registry-server $acrLoginServer `
  --registry-username $acrUsername `
  --registry-password $acrPassword `
  --target-port 8080 `
  --ingress external `
  --min-replicas 0 `
  --max-replicas 3 `
  --cpu 0.5 `
  --memory 1.0Gi `
  --env-vars `
    "AZURE_OPENAI_ENDPOINT=$azureOpenAIEndpoint" `
    "AZURE_OPENAI_MODEL=$azureOpenAIModel" `
    "PORT=8080" `
  --system-assigned

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create Container App." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Container App created!" -ForegroundColor Green

# ============================================
# STEP 5: Get Managed Identity Principal ID
# ============================================
Write-Host "`n🔐 Step 5: Getting Managed Identity details..." -ForegroundColor Yellow

$principalId = az containerapp show `
  --name $containerAppName `
  --resource-group $resourceGroup `
  --query identity.principalId -o tsv

Write-Host "✅ Managed Identity Principal ID: $principalId" -ForegroundColor Green

# ============================================
# STEP 6: Assign RBAC Role to Managed Identity
# ============================================
Write-Host "`n🔑 Step 6: Assigning RBAC permissions..." -ForegroundColor Yellow

# Get Foundry resource ID
$foundryResourceId = az cognitiveservices account show `
  --name "testaimodel-sbal" `
  --resource-group $resourceGroup `
  --query id -o tsv

# Assign "Cognitive Services OpenAI User" role
az role assignment create `
  --assignee $principalId `
  --role "Cognitive Services OpenAI User" `
  --scope $foundryResourceId

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Warning: RBAC assignment may have failed. You might need to assign it manually." -ForegroundColor Yellow
} else {
    Write-Host "✅ RBAC role assigned successfully!" -ForegroundColor Green
}

# ============================================
# STEP 7: Get Application URL
# ============================================
Write-Host "`n🎉 Deployment Complete!" -ForegroundColor Green

$appUrl = az containerapp show `
  --name $containerAppName `
  --resource-group $resourceGroup `
  --query properties.configuration.ingress.fqdn -o tsv

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "✅ YOUR APP IS DEPLOYED!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Backend API URL: https://$appUrl/api" -ForegroundColor Yellow
Write-Host "Health Check:    https://$appUrl/api/health" -ForegroundColor Yellow
Write-Host "`nNext Steps:" -ForegroundColor White
Write-Host "1. Test the health endpoint: curl https://$appUrl/api/health" -ForegroundColor White
Write-Host "2. Update frontend config.js with: BACKEND_API_URL: 'https://$appUrl/api'" -ForegroundColor White
Write-Host "3. Open index.html and start using your app!" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Cyan
