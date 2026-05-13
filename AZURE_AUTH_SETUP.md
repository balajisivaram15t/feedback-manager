# Azure Entra ID Authentication Setup Guide

Your Performance Feedback Manager has been updated to support **Azure Entra ID (Azure AD) authentication** for secure, token-based access to Azure OpenAI/Foundry.

## 🎯 What Changed?

Your app now supports two authentication methods:
1. **Azure Entra ID** (Recommended) - Token-based authentication
2. **API Key** - Traditional API key (if enabled on your resource)

## 📋 Prerequisites

Before you start, you need:
- Azure subscription with Azure OpenAI or Azure AI Foundry resource
- gpt-4.1 model deployed
- Permission to create App Registrations in Azure AD

## 🔧 Setup Steps

### Step 1: Create an Azure AD App Registration

1. Go to **Azure Portal** (https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **+ New registration**
4. Configure:
   - **Name**: `Performance Feedback Manager`
   - **Supported account types**: Choose based on your needs (typically "Accounts in this organizational directory only")
   - **Redirect URI**: Select "Single-page application (SPA)" and enter: `http://localhost:8000` (or your app's URL)
5. Click **Register**

### Step 2: Get Your App Registration Details

After registration, you'll see the **Overview** page:

1. **Copy Application (client) ID** - You'll need this
2. **Copy Directory (tenant) ID** - You'll need this
3. Go to **Authentication** (left menu)
   - Verify the redirect URI is correct
   - Under **Implicit grant and hybrid flows**, enable:
     - ✅ **ID tokens**
   - Click **Save**

### Step 3: Grant API Permissions

1. In your App Registration, go to **API permissions** (left menu)
2. Click **+ Add a permission**
3. Select **APIs my organization uses**
4. Search for **"Cognitive Services"** or **"Azure AI Services"**
5. Select **Azure Cognitive Services**
6. Choose **Delegated permissions**
7. Check: `user_impersonation`
8. Click **Add permissions**
9. (Optional) Click **Grant admin consent** if you have admin rights

### Step 4: Assign RBAC Role to Your User

1. Go to your **Azure OpenAI** or **Azure AI Foundry** resource
2. Click **Access control (IAM)** in the left menu
3. Click **+ Add** → **Add role assignment**
4. Select role: **Cognitive Services OpenAI User** (or **Cognitive Services User**)
5. Click **Next**
6. **Select members**: Add your user account
7. Click **Review + assign**

### Step 5: Configure Your App

1. Open your app: `index.html` in a browser
2. Click the **⚙️ Settings** button
3. Select **🔐 Azure Entra ID**
4. Enter:
   - **Application (Client) ID**: From Step 2
   - **Directory (Tenant) ID**: From Step 2
5. Click **"Sign in with Microsoft"**
6. A popup will open - sign in with your Microsoft account
7. Grant consent when prompted
8. After successful sign-in, fill in:
   - **Model Name**: `gpt-4.1`
   - **API Endpoint**: Your Azure endpoint (e.g., `https://testaimodel-sbal.services.ai.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2024-10-21`)
9. Click **Save & Continue**

## 🚀 Using the App

1. Once configured, enter performance notes in the text area
2. Choose a feedback style
3. Click **Generate Feedback**
4. The app will:
   - Get an access token from Azure AD
   - Call your Azure OpenAI/Foundry API
   - Display the feedback

## 🔄 Token Refresh

The app automatically refreshes tokens when they expire. If you see authentication errors:
1. Open **⚙️ Settings**
2. Click **Sign in with Microsoft** again

## 🔒 Security Features

- ✅ No API keys stored in browser
- ✅ Tokens refresh automatically
- ✅ Azure AD authentication
- ✅ RBAC-based access control
- ✅ Configuration stored securely in browser localStorage

## ❓ Troubleshooting

### Error: "AADSTS650051: access_as_user scope is not enabled"
- Go to your App Registration → **Expose an API**
- Add a scope called `access_as_user`
- Retry sign-in

### Error: "Insufficient permissions"
- Verify RBAC role assignment (Step 4)
- Make sure you have **Cognitive Services OpenAI User** role

### Error: "Sign-in popup blocked"
- Allow popups for your app domain
- Try signing in again

### Error: "Invalid endpoint"
- Verify your API endpoint format matches:
  - Azure Foundry: `https://YOUR-RESOURCE.services.ai.azure.com/openai/deployments/YOUR-MODEL/chat/completions?api-version=2024-10-21`
  - Azure OpenAI: `https://YOUR-RESOURCE.openai.azure.com/openai/deployments/YOUR-MODEL/chat/completions?api-version=2024-10-21`

## 📚 Resources

- [Azure App Registration Documentation](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Azure OpenAI Authentication](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/managed-identity)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)

## 🆘 Need Help?

If you encounter issues:
1. Check browser console for detailed error messages (F12 → Console)
2. Verify all setup steps were completed
3. Ensure your Azure resource has key-based auth disabled (forcing token auth)
4. Check that your user has the correct RBAC role assigned

---

**Last Updated**: May 2026
