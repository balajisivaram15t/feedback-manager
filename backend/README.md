# Performance Feedback Manager - Backend API

Python Flask backend that proxies requests to Azure OpenAI using Managed Identity authentication.

## Features

- 🔐 **Managed Identity** authentication (no API keys)
- 🚀 **Flask + Gunicorn** for production
- 🌐 **CORS enabled** for frontend access
- ✅ **Health check** endpoint
- 📝 **Request logging**

## Quick Start - Local Development

```powershell
# Create virtual environment
python -m venv venv

# Activate
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Login to Azure (uses your identity)
az login

# Run locally
python app.py
```

Backend runs on `http://localhost:8080`

## API Endpoints

### GET /api/health
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "service": "Performance Feedback Manager API",
  "version": "1.0.0"
}
```

### POST /api/chat/completions
Proxy to Azure OpenAI chat completions

**Request:**
```json
{
  "model": "gpt-4.1",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Hello"}
  ],
  "temperature": 0.7,
  "max_tokens": 500
}
```

**Response:** Same as Azure OpenAI API response

### GET /api/config
Get backend configuration (for debugging)

## Environment Variables

Configure these in Azure App Service or local `.env` file:

```bash
AZURE_OPENAI_ENDPOINT=https://your-resource.services.ai.azure.com/openai/deployments/your-model/chat/completions?api-version=2024-10-21
AZURE_OPENAI_MODEL=gpt-4.1
PORT=8080
```

## Deployment

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for full Azure deployment instructions.

## Authentication

The backend uses **Azure DefaultAzureCredential** which authenticates in this order:

1. **Managed Identity** (in Azure App Service)
2. **Azure CLI** (local development with `az login`)
3. **Environment variables** (if configured)

No API keys needed! 🎉

## Security

- ✅ No API keys stored or exposed
- ✅ Managed Identity for Azure authentication
- ✅ CORS configured for frontend access
- ✅ HTTPS enforced in production

## Local Testing

```powershell
# Start backend
python app.py

# Test health endpoint
curl http://localhost:8080/api/health

# Open frontend in browser (index.html)
# Make sure config.js has:
# BACKEND_API_URL: 'http://localhost:8080/api'
# AUTH_MODE: 'backend'
```

## Troubleshooting

**Error: "Failed to get access token"**
- Run `az login` to authenticate locally
- In Azure, verify Managed Identity is enabled
- Check RBAC: Managed Identity needs "Cognitive Services OpenAI User" role

**Error: "Module not found"**
- Activate virtual environment: `.\venv\Scripts\Activate.ps1`
- Install dependencies: `pip install -r requirements.txt`

**CORS errors**
- Verify CORS is enabled in app.py
- Check frontend is calling correct backend URL
