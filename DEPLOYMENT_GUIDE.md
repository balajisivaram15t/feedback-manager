# 🚀 Azure App Service Deployment Guide

This guide walks you through deploying the Performance Feedback Manager backend to Azure App Service with Managed Identity authentication.

## 📋 Overview

**Architecture:**
- **Frontend**: Static HTML/JS (runs in browser)
- **Backend**: Python Flask API (Azure App Service with Managed Identity)
- **Authentication**: Backend uses Managed Identity to call Azure OpenAI
- **Users**: No login required - just access the hosted web app!

## ✅ Prerequisites

- Azure CLI installed (`az --version`)
- Logged in to Azure (`az login`)
- Your Azure OpenAI/Foundry resource: `testaimodel-sbal`
- gpt-4.1 model deployed

## 🔧 Step 1: Test Backend Locally (Optional)

Before deploying, test the backend on your local machine:

```powershell
# Navigate to backend folder
cd c:\Users\sbal\Self-AKS-Project\meera-ask\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Make sure you're logged in to Azure CLI
az login

# Run the backend
python app.py
```

The backend will start on `http://localhost:8080`

Test it:
```powershell
# Health check
curl http://localhost:8080/api/health

# Open the frontend (index.html in browser)
# It should work with the local backend!
```

Press `Ctrl+C` to stop the backend when done testing.

---

## 🚀 Step 2: Deploy to Azure App Service

### 2.1 Create Azure App Service

```powershell
# Set variables
$resourceGroup = "your-resource-group"  # Same as your Foundry resource
$location = "eastus2"  # Same region as your Foundry resource
$appServicePlan = "feedback-manager-plan"
$webAppName = "feedback-manager-app"  # Must be globally unique

# Create App Service Plan (Linux, B1 tier)
az appservice plan create `
  --name $appServicePlan `
  --resource-group $resourceGroup `
  --location $location `
  --sku B1 `
  --is-linux

# Create Web App (Python 3.11)
az webapp create `
  --name $webAppName `
  --resource-group $resourceGroup `
  --plan $appServicePlan `
  --runtime "PYTHON:3.11"
```

### 2.2 Enable Managed Identity

```powershell
# Enable system-assigned managed identity
az webapp identity assign `
  --name $webAppName `
  --resource-group $resourceGroup

# Get the identity's principal ID (save this!)
$principalId = az webapp identity show `
  --name $webAppName `
  --resource-group $resourceGroup `
  --query principalId -o tsv

Write-Host "Managed Identity Principal ID: $principalId"
```

### 2.3 Grant RBAC Permissions to Managed Identity

Grant the Managed Identity permission to access your Azure OpenAI resource:

```powershell
# Get your Azure OpenAI resource ID
$resourceId = az cognitiveservices account show `
  --name "testaimodel-sbal" `
  --resource-group $resourceGroup `
  --query id -o tsv

# Assign "Cognitive Services OpenAI User" role
az role assignment create `
  --assignee $principalId `
  --role "Cognitive Services OpenAI User" `
  --scope $resourceId

Write-Host "✅ RBAC role assigned successfully!"
```

### 2.4 Configure Environment Variables

Set the backend configuration:

```powershell
# Configure backend environment variables
az webapp config appsettings set `
  --name $webAppName `
  --resource-group $resourceGroup `
  --settings `
    AZURE_OPENAI_ENDPOINT="https://testaimodel-sbal.services.ai.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2024-10-21" `
    AZURE_OPENAI_MODEL="gpt-4.1" `
    PORT="8080"
```

### 2.5 Configure Startup Command

```powershell
# Set startup command for gunicorn
az webapp config set `
  --name $webAppName `
  --resource-group $resourceGroup `
  --startup-file "gunicorn --bind=0.0.0.0:8080 --timeout 600 --workers 2 app:app"
```

### 2.6 Deploy Backend Code

Deploy the backend folder to Azure:

```powershell
# Navigate to project root
cd c:\Users\sbal\Self-AKS-Project\meera-ask

# Deploy backend folder
az webapp up `
  --name $webAppName `
  --resource-group $resourceGroup `
  --runtime "PYTHON:3.11" `
  --plan $appServicePlan `
  --src-path "./backend"

Write-Host "✅ Backend deployed successfully!"
```

### 2.7 Enable CORS

Allow your frontend to call the backend:

```powershell
# Enable CORS for all origins (or specify your domain)
az webapp cors add `
  --name $webAppName `
  --resource-group $resourceGroup `
  --allowed-origins "*"

# Or for specific domain:
# --allowed-origins "https://yourdomain.com"
```

### 2.8 Test the Backend

```powershell
# Get the app URL
$appUrl = "https://$webAppName.azurewebsites.net"
Write-Host "Backend URL: $appUrl"

# Test health endpoint
curl "$appUrl/api/health"

# Expected response:
# {"status":"healthy","service":"Performance Feedback Manager API","version":"1.0.0"}
```

---

## 🌐 Step 3: Update Frontend Configuration

Update your frontend to use the deployed backend:

1. Open `config.js`
2. Update the `BACKEND_API_URL`:

```javascript
window.CONFIG = {
    // Update this with your deployed backend URL
    BACKEND_API_URL: 'https://feedback-manager-app.azurewebsites.net/api',
    
    // ... rest of config
};
```

3. Ensure `AUTH_MODE` is set to `'backend'`:

```javascript
AUTH_MODE: 'backend'  // This tells frontend to use backend proxy
```

---

## 🎯 Step 4: Deploy Frontend

You have several options for hosting the frontend:

### Option A: Azure Storage Static Website (Recommended)

```powershell
# Create storage account
$storageAccount = "feedbackmanagerfe"  # Must be globally unique
az storage account create `
  --name $storageAccount `
  --resource-group $resourceGroup `
  --location $location `
  --sku Standard_LRS `
  --kind StorageV2

# Enable static website hosting
az storage blob service-properties update `
  --account-name $storageAccount `
  --static-website true `
  --index-document index.html `
  --404-document index.html

# Upload frontend files
az storage blob upload-batch `
  --account-name $storageAccount `
  --source . `
  --destination '$web' `
  --pattern "*.html" "*.js" "*.css"

# Get the website URL
$websiteUrl = az storage account show `
  --name $storageAccount `
  --resource-group $resourceGroup `
  --query "primaryEndpoints.web" -o tsv

Write-Host "✅ Frontend deployed at: $websiteUrl"
```

### Option B: Host on Same App Service

```powershell
# Upload frontend to App Service wwwroot
az webapp deployment source config-zip `
  --name $webAppName `
  --resource-group $resourceGroup `
  --src frontend.zip

# Access at: https://feedback-manager-app.azurewebsites.net
```

### Option C: Keep it Local

Just open `index.html` in your browser - it will call the deployed backend API!

---

## ✅ Step 5: Test Everything

1. **Open your frontend** (Azure Storage URL or local `index.html`)
2. **Enter performance notes** in the text area
3. **Select feedback style**
4. **Click "Generate Feedback"**
5. **Verify feedback is generated** ✨

If it works - congratulations! 🎉 Your app is fully deployed!

---

## 🔍 Troubleshooting

### Backend Logs

View backend logs to debug issues:

```powershell
# Stream logs
az webapp log tail `
  --name $webAppName `
  --resource-group $resourceGroup

# Or view in Azure Portal:
# App Service → Log stream
```

### Common Issues

**Error: "Failed to get access token"**
- Verify Managed Identity is enabled
- Check RBAC role assignment
- Ensure principal ID is correct

**Error: "CORS error"**
- Verify CORS is enabled on backend
- Check allowed origins include your frontend domain

**Error: "Backend connection failed"**
- Verify backend is running: `https://your-app.azurewebsites.net/api/health`
- Check `BACKEND_API_URL` in frontend config.js
- Look at browser console for errors (F12)

**Backend returns 500 error**
- Check backend logs: `az webapp log tail`
- Verify environment variables are set correctly
- Ensure Managed Identity has correct permissions

### Test Individual Components

```powershell
# Test backend health
curl https://your-app.azurewebsites.net/api/health

# Test backend config
curl https://your-app.azurewebsites.net/api/config

# Check App Service status
az webapp show `
  --name $webAppName `
  --resource-group $resourceGroup `
  --query state
```

---

## 📊 Monitoring & Maintenance

### View Application Insights

```powershell
# Enable Application Insights
az webapp config appsettings set `
  --name $webAppName `
  --resource-group $resourceGroup `
  --settings APPLICATIONINSIGHTS_CONNECTION_STRING="your-connection-string"
```

### Scale the App Service

```powershell
# Scale up (more powerful VM)
az appservice plan update `
  --name $appServicePlan `
  --resource-group $resourceGroup `
  --sku B2

# Scale out (more instances)
az appservice plan update `
  --name $appServicePlan `
  --resource-group $resourceGroup `
  --number-of-workers 2
```

---

## 🎁 Benefits of This Architecture

✅ **No user authentication required** - Users just access the URL  
✅ **Secure** - Managed Identity, no API keys exposed  
✅ **Scalable** - Azure App Service auto-scaling  
✅ **Auditable** - All API calls tracked under Managed Identity  
✅ **Cost-effective** - B1 tier (~$13/month) or Free tier for testing  
✅ **Easy sharing** - Just share the URL with users!  

---

## 📚 Resources

- [Azure App Service Python Docs](https://learn.microsoft.com/en-us/azure/app-service/quickstart-python)
- [Managed Identity Overview](https://learn.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/overview)
- [Azure OpenAI with Managed Identity](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/managed-identity)

---

## 🆘 Need Help?

Check the logs first:
```powershell
az webapp log tail --name $webAppName --resource-group $resourceGroup
```

Open browser console (F12) to see frontend errors.

**Last Updated**: May 2026
