// Azure Entra ID Authentication Manager using MSAL.js
// Handles Microsoft authentication for Azure OpenAI/Foundry API access

class AzureAuthManager {
    constructor() {
        this.msalInstance = null;
        this.account = null;
        this.STORAGE_KEY = 'azure_auth_config';
    }

    /**
     * Initialize MSAL with Azure AD configuration
     * @param {Object} config - Azure AD configuration
     * @param {string} config.clientId - Application (Client) ID
     * @param {string} config.tenantId - Directory (Tenant) ID
     */
    initialize(config) {
        if (!config.clientId || !config.tenantId) {
            throw new Error('Client ID and Tenant ID are required');
        }

        const msalConfig = {
            auth: {
                clientId: config.clientId,
                authority: `https://login.microsoftonline.com/${config.tenantId}`,
                redirectUri: window.location.origin,
                navigateToLoginRequestUrl: false
            },
            cache: {
                cacheLocation: 'localStorage',
                storeAuthStateInCookie: false
            }
        };

        this.msalInstance = new msal.PublicClientApplication(msalConfig);
        
        // Save configuration
        this.saveConfig(config);
        
        return this.msalInstance.initialize();
    }

    /**
     * Sign in with popup
     */
    async signIn() {
        if (!this.msalInstance) {
            throw new Error('MSAL not initialized. Call initialize() first.');
        }

        try {
            const loginRequest = {
                scopes: ['https://cognitiveservices.azure.com/.default']
            };

            const loginResponse = await this.msalInstance.loginPopup(loginRequest);
            this.account = loginResponse.account;
            
            return {
                success: true,
                account: this.account,
                message: `Signed in as ${this.account.username}`
            };
        } catch (error) {
            console.error('Sign in error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get access token for Azure Cognitive Services
     * @returns {Promise<string>} Access token
     */
    async getAccessToken() {
        if (!this.msalInstance) {
            throw new Error('MSAL not initialized');
        }

        const accounts = this.msalInstance.getAllAccounts();
        if (accounts.length === 0) {
            throw new Error('No signed-in account found. Please sign in first.');
        }

        this.account = accounts[0];

        const tokenRequest = {
            scopes: ['https://cognitiveservices.azure.com/.default'],
            account: this.account
        };

        try {
            // Try to get token silently
            const response = await this.msalInstance.acquireTokenSilent(tokenRequest);
            return response.accessToken;
        } catch (error) {
            console.warn('Silent token acquisition failed, trying interactive:', error);
            
            // If silent acquisition fails, try interactive
            try {
                const response = await this.msalInstance.acquireTokenPopup(tokenRequest);
                return response.accessToken;
            } catch (popupError) {
                console.error('Token acquisition failed:', popupError);
                throw new Error('Failed to acquire access token. Please sign in again.');
            }
        }
    }

    /**
     * Sign out
     */
    async signOut() {
        if (!this.msalInstance) {
            return;
        }

        const logoutRequest = {
            account: this.account
        };

        try {
            await this.msalInstance.logoutPopup(logoutRequest);
            this.account = null;
            this.clearConfig();
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Check if user is signed in
     */
    isSignedIn() {
        if (!this.msalInstance) {
            return false;
        }

        const accounts = this.msalInstance.getAllAccounts();
        if (accounts.length > 0) {
            this.account = accounts[0];
            return true;
        }
        return false;
    }

    /**
     * Get current signed-in account
     */
    getCurrentAccount() {
        if (!this.msalInstance) {
            return null;
        }

        const accounts = this.msalInstance.getAllAccounts();
        return accounts.length > 0 ? accounts[0] : null;
    }

    /**
     * Save Azure AD configuration to localStorage
     */
    saveConfig(config) {
        try {
            const encoded = btoa(JSON.stringify(config));
            localStorage.setItem(this.STORAGE_KEY, encoded);
            return true;
        } catch (error) {
            console.error('Failed to save config:', error);
            return false;
        }
    }

    /**
     * Get saved Azure AD configuration
     */
    getConfig() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return null;
            
            return JSON.parse(atob(stored));
        } catch (error) {
            console.error('Failed to get config:', error);
            return null;
        }
    }

    /**
     * Clear saved configuration
     */
    clearConfig() {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    /**
     * Check if configuration exists
     */
    hasConfig() {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    }
}

// Create global instance
window.azureAuthManager = new AzureAuthManager();
