// Configuration file for the Performance Feedback Manager
// IMPORTANT: Replace these values with your actual API credentials

window.CONFIG = {
    // Your LLM API Key
    // For OpenAI: Get from https://platform.openai.com/api-keys
    // For Azure OpenAI: Get from Azure portal
    // For other providers: Check their documentation
    API_KEY: 'your-api-key-here',
    
    // Model name to use
    // OpenAI examples: 'gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'
    // Azure OpenAI: Your deployment name
    // Other providers: Check their model names
    MODEL_NAME: 'gpt-3.5-turbo',
    
    // API Endpoint (optional - defaults to OpenAI)
    // Leave as default for OpenAI
    // For Azure OpenAI: 'https://your-resource-name.openai.azure.com/openai/deployments/your-deployment-name/chat/completions?api-version=2024-02-15-preview'
    // For other providers: Their chat completion endpoint
    API_ENDPOINT: 'https://api.openai.com/v1/chat/completions'
};

// NOTE: For production use, never commit API keys to version control
// Consider using environment variables or a secure backend service
