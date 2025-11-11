// Configuration file for the Performance Feedback Manager
// IMPORTANT: This file no longer stores API credentials for security reasons
// Credentials are now stored securely in your browser's local storage
// Last updated: 2025-11-11

window.CONFIG = {
    // Default API Endpoint (can be overridden in settings)
    DEFAULT_ENDPOINT: 'https://testaimodel-sbal.cognitiveservices.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2025-01-01-preview',
    
    // Default Model (can be overridden in settings)
    DEFAULT_MODEL: 'gpt-4o-mini',
    
    // Application Settings
    APP_NAME: 'Performance Feedback Manager',
    MAX_TOKENS: 500,
    TEMPERATURE: 0.7
};

// NOTE: API credentials are managed through the Settings modal (⚙️ button)
// They are stored securely in browser localStorage and never committed to Git
// Click the settings button to configure your API key, model, and endpoint
