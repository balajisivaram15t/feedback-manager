// Secure Credential Manager
// Handles secure storage and retrieval of API credentials using browser localStorage
// Supports both API Key and Azure Entra ID authentication

class CredentialManager {
    constructor() {
        this.STORAGE_KEY = 'feedback_manager_credentials';
        this.ENCRYPTED_PREFIX = 'enc_';
    }

    /**
     * Save credentials to secure storage
     * @param {Object} credentials - The credentials object
     * @param {string} credentials.authMethod - Authentication method: 'api-key' or 'entra-id'
     * @param {string} credentials.apiKey - API key (for api-key method)
     * @param {string} credentials.modelName - Model name
     * @param {string} credentials.apiEndpoint - API endpoint
     */
    saveCredentials(credentials) {
        try {
            // Basic obfuscation (not true encryption, but better than plain text)
            const encoded = btoa(JSON.stringify(credentials));
            localStorage.setItem(this.STORAGE_KEY, this.ENCRYPTED_PREFIX + encoded);
            return true;
        } catch (error) {
            console.error('Failed to save credentials:', error);
            return false;
        }
    }

    /**
     * Retrieve credentials from secure storage
     * @returns {Object|null} Credentials object or null if not found
     */
    getCredentials() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return null;

            // Remove prefix and decode
            const encoded = stored.startsWith(this.ENCRYPTED_PREFIX) 
                ? stored.substring(this.ENCRYPTED_PREFIX.length) 
                : stored;
            
            const credentials = JSON.parse(atob(encoded));
            
            // Validate credentials structure
            if (!credentials.modelName || !credentials.authMethod) {
                return null;
            }
            
            return credentials;
        } catch (error) {
            console.error('Failed to retrieve credentials:', error);
            return null;
        }
    }

    /**
     * Check if credentials exist
     * @returns {boolean}
     */
    hasCredentials() {
        return !!localStorage.getItem(this.STORAGE_KEY);
    }

    /**
     * Clear stored credentials
     */
    clearCredentials() {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    /**
     * Validate credentials format
     * @param {Object} credentials
     * @returns {Object} Validation result
     */
    validateCredentials(credentials) {
        const errors = [];

        // Validate authentication method
        if (!credentials.authMethod) {
            errors.push('Authentication method is required');
        }

        // Validate based on authentication method
        if (credentials.authMethod === 'api-key') {
            if (!credentials.apiKey || credentials.apiKey.trim().length === 0) {
                errors.push('API Key is required for API Key authentication');
            } else if (credentials.apiKey === 'your-api-key-here') {
                errors.push('Please enter a valid API Key');
            }
        }

        // Common validations
        if (!credentials.modelName || credentials.modelName.trim().length === 0) {
            errors.push('Model Name is required');
        }

        if (!credentials.apiEndpoint || credentials.apiEndpoint.trim().length === 0) {
            errors.push('API Endpoint is required');
        } else {
            // Basic URL validation
            try {
                new URL(credentials.apiEndpoint);
            } catch {
                errors.push('API Endpoint must be a valid URL');
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Get default endpoint based on provider detection
     * @param {string} apiKey
     * @returns {string}
     */
    getDefaultEndpoint(apiKey) {
        // Try to detect provider from API key format
        if (apiKey.startsWith('sk-')) {
            return 'https://api.openai.com/v1/chat/completions';
        }
        // Default to OpenAI-compatible endpoint
        return window.CONFIG?.DEFAULT_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
    }
}

// Export singleton instance
window.credentialManager = new CredentialManager();
