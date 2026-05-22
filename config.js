// Configuration file for the Performance Feedback Manager
// IMPORTANT: This file no longer stores API credentials for security reasons
// Credentials are now stored securely in your browser's local storage
// Last updated: 2025-11-11

window.CONFIG = {
    // Backend API Endpoint (local or Azure App Service)
    BACKEND_API_URL: 'https://feedback-manager-app.victoriousdesert-7290a895.eastus2.azurecontainerapps.io/api',  // Your deployed backend
    
    // Azure OpenAI Configuration (used by backend)
    DEFAULT_ENDPOINT: 'https://testaimodel-sbal.services.ai.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2024-10-21',
    DEFAULT_MODEL: 'gpt-4.1',
    
    // Application Settings
    APP_NAME: 'Performance Feedback Manager',
    MAX_TOKENS: 2500,  // Increased to support detailed table formats and comprehensive feedback
    TEMPERATURE: 0.7,
    
    // Authentication Mode: 'backend' (uses backend proxy) or 'direct' (direct Azure AD)
    AUTH_MODE: 'backend'  // Set to 'backend' to use the proxy
};

// NOTE: API credentials are managed through the Settings modal (⚙️ button)
// They are stored securely in browser localStorage and never committed to Git
// Click the settings button to configure your API key, model, and endpoint
