# Simple Azure Container Apps Deployment
# Run each section step by step

# ============================================
# CONFIGURATION
# ============================================
$resourceGroup = "rg-feedback-mgr"
$location = "eastus2"
$acrName = "feedbackmanageracr123"  # Change this to be unique!
$containerAppEnv = "feedback-manager-env"
$containerAppName = "feedback-manager-app"

# ============================================
# STEP 1: Create Container Registry
# ============================================
Write-Host "Step 1: Creating Azure Container Registry..." -ForegroundColor Yellow

az acr create --name $acrName --resource-group $resourceGroup --location $location --sku Basic --admin-enabled true

Write-Host "Getting ACR credentials..." -ForegroundColor Yellow
$acrServer = az acr show --name $acrName --query loginServer -o tsv
$acrUser = az acr credential show --name $acrName --query username -o tsv  
$acrPass = az acr credential show --name $acrName --query "passwords[0].value" -o tsv

Write-Host "ACR Server: $acrServer" -ForegroundColor Green

# ============================================
# STEP 2: Build and Push Image
# ============================================
Write-Host "`nStep 2: Building Docker image..." -ForegroundColor Yellow

az acr build --registry $acrName --image feedback-manager:latest --file Dockerfile .

# ============================================
# STEP 3: Create Container Apps Environment
# ============================================
Write-Host "`nStep 3: Creating Container Apps Environment..." -ForegroundColor Yellow

az containerapp env create --name $containerAppEnv --resource-group $resourceGroup --location $location

# ============================================
# STEP 4: Deploy Container App
# ============================================
Write-Host "`nStep 4: Creating Container App..." -ForegroundColor Yellow

$imageName = "$acrServer/feedback-manager:latest"

az containerapp create `
  --name $containerAppName `
  --resource-group $resourceGroup `
  --environment $containerAppEnv `
  --image $imageName `
  --target-port 8080 `
  --ingress external `
  --registry-server $acrServer `
  --registry-username $acrUser `
  --registry-password $acrPass `
  --min-replicas 0 `
  --max-replicas 3 `
  --cpu 0.5 `
  --memory 1.0Gi `
  --system-assigned `
  --env-vars AZURE_OPENAI_ENDPOINT="https://testaimodel-sbal.services.ai.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2024-10-21" AZURE_OPENAI_MODEL="gpt-4.1" PORT="8080"

# ============================================
# STEP 5: Configure Managed Identity RBAC
# ============================================
Write-Host "`nStep 5: Configuring RBAC..." -ForegroundColor Yellow

$principalId = az containerapp show --name $containerAppName --resource-group $resourceGroup --query identity.principalId -o tsv
Write-Host "Principal ID: $principalId" -ForegroundColor Green

# Assign role to Foundry resource
az role assignment create --assignee $principalId --role "Cognitive Services OpenAI User" --scope "/subscriptions/75347d85-a20c-4d20-9198-4e8b5d19e8c2/resourceGroups/rg-feedback-mgr/providers/Microsoft.CognitiveServices/accounts/testaimodel-sbal"

# ============================================
# STEP 6: Get App URL
# ============================================
Write-Host "`nStep 6: Getting app URL..." -ForegroundColor Yellow

$appUrl = az containerapp show --name $containerAppName --resource-group $resourceGroup --query properties.configuration.ingress.fqdn -o tsv

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend URL: https://$appUrl/api" -ForegroundColor Yellow
Write-Host "Health Check: https://$appUrl/api/health" -ForegroundColor Yellow
Write-Host "`nTest it: curl https://$appUrl/api/health" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
