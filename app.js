// Main application logic
class FeedbackManager {
    constructor() {
        this.performanceInput = document.getElementById('performanceInput');
        this.corePriorities = document.getElementById('corePriorities');
        this.clearPrioritiesButton = document.getElementById('clearPriorities');
        this.generateButton = document.getElementById('generateButton');
        this.statusText = document.getElementById('statusText');
        this.settingsButton = document.getElementById('settingsButton');
        this.settingsModal = document.getElementById('settingsModal');
        this.resultsPanel = document.getElementById('resultsPanel');
        this.feedbackOutput = document.getElementById('feedbackOutput');
        this.clearResultsButton = document.getElementById('clearResultsButton');
        
        this.PRIORITIES_STORAGE_KEY = 'feedback_manager_core_priorities';
        
        this.loadCorePriorities();
        this.initializeEventListeners();
        this.initializeSettingsModal();
        this.checkConfiguration();
    }

    loadCorePriorities() {
        // Load saved priorities from localStorage
        const savedPriorities = localStorage.getItem(this.PRIORITIES_STORAGE_KEY);
        if (savedPriorities && this.corePriorities) {
            this.corePriorities.value = savedPriorities;
        }
    }

    saveCorePriorities() {
        // Auto-save priorities to localStorage
        if (this.corePriorities) {
            const priorities = this.corePriorities.value.trim();
            if (priorities) {
                localStorage.setItem(this.PRIORITIES_STORAGE_KEY, priorities);
            } else {
                localStorage.removeItem(this.PRIORITIES_STORAGE_KEY);
            }
        }
    }

    clearCorePriorities() {
        if (confirm('Are you sure you want to clear your core priorities? They will be permanently deleted.')) {
            this.corePriorities.value = '';
            localStorage.removeItem(this.PRIORITIES_STORAGE_KEY);
            this.updateStatus('✅ Core priorities cleared', 'success');
        }
    }

    initializeEventListeners() {
        // Generate button click
        this.generateButton.addEventListener('click', () => this.handleGenerate());
        
        // Clear results button click
        this.clearResultsButton.addEventListener('click', () => this.clearResults());
        
        // Settings button
        this.settingsButton.addEventListener('click', () => this.openSettings());
        
        // Core Priorities auto-save
        if (this.corePriorities) {
            this.corePriorities.addEventListener('input', () => this.saveCorePriorities());
            this.corePriorities.addEventListener('blur', () => this.saveCorePriorities());
        }
        
        // Clear priorities button
        if (this.clearPrioritiesButton) {
            this.clearPrioritiesButton.addEventListener('click', () => this.clearCorePriorities());
        }
        
        // Handle custom prompt toggle
        const styleRadios = document.querySelectorAll('input[name="feedbackStyle"]');
        const customPromptArea = document.getElementById('customPromptArea');
        
        styleRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'custom') {
                    customPromptArea.style.display = 'block';
                } else {
                    customPromptArea.style.display = 'none';
                }
            });
        });
    }

    initializeSettingsModal() {
        const closeModal = document.getElementById('closeModal');
        const credentialsForm = document.getElementById('credentialsForm');
        const toggleApiKey = document.getElementById('toggleApiKey');
        const clearCredentials = document.getElementById('clearCredentials');
        const signInButton = document.getElementById('signInButton');
        
        // Handle authentication method toggle
        const authMethodRadios = document.querySelectorAll('input[name="authMethod"]');
        const entraIdSection = document.getElementById('entraIdSection');
        const apiKeySection = document.getElementById('apiKeySection');
        
        authMethodRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'entra-id') {
                    entraIdSection.style.display = 'block';
                    apiKeySection.style.display = 'none';
                } else {
                    entraIdSection.style.display = 'none';
                    apiKeySection.style.display = 'block';
                }
            });
        });
        
        // Sign in with Azure AD
        if (signInButton) {
            signInButton.addEventListener('click', async () => {
                await this.handleAzureSignIn();
            });
        }
        
        // Close modal
        closeModal.addEventListener('click', () => this.closeSettings());
        
        // Close on outside click
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });
        
        // Toggle API key visibility
        if (toggleApiKey) {
            toggleApiKey.addEventListener('click', () => {
                const apiKeyInput = document.getElementById('apiKey');
                if (apiKeyInput) {
                    apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
                    toggleApiKey.textContent = apiKeyInput.type === 'password' ? '👁️' : '🙈';
                }
            });
        }
        
        // Clear credentials
        clearCredentials.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all stored credentials and sign out?')) {
                window.credentialManager.clearCredentials();
                if (window.azureAuthManager) {
                    window.azureAuthManager.signOut();
                    window.azureAuthManager.clearConfig();
                }
                this.closeSettings();
                this.checkConfiguration();
            }
        });
        
        // Form submission
        credentialsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCredentials();
        });
    }

    async handleAzureSignIn() {
        const clientId = document.getElementById('clientId').value.trim();
        const tenantId = document.getElementById('tenantId').value.trim();
        const signInStatus = document.getElementById('signInStatus');
        
        if (!clientId || !tenantId) {
            signInStatus.textContent = '❌ Please enter Client ID and Tenant ID';
            signInStatus.style.color = '#dc3545';
            return;
        }
        
        try {
            signInStatus.textContent = '🔄 Initializing authentication...';
            signInStatus.style.color = '#007bff';
            
            // Initialize MSAL
            await window.azureAuthManager.initialize({ clientId, tenantId });
            
            signInStatus.textContent = '🔄 Opening sign-in window...';
            
            // Sign in
            const result = await window.azureAuthManager.signIn();
            
            if (result.success) {
                signInStatus.textContent = `✅ ${result.message}`;
                signInStatus.style.color = '#28a745';
            } else {
                signInStatus.textContent = `❌ Sign-in failed: ${result.error}`;
                signInStatus.style.color = '#dc3545';
            }
        } catch (error) {
            signInStatus.textContent = `❌ Error: ${error.message}`;
            signInStatus.style.color = '#dc3545';
        }
    }

    openSettings() {
        // Load existing credentials if any
        const credentials = window.credentialManager.getCredentials();
        const azureConfig = window.azureAuthManager.getConfig();
        
        if (credentials) {
            // Set authentication method
            const authMethod = credentials.authMethod || 'entra-id';
            document.querySelector(`input[name="authMethod"][value="${authMethod}"]`).checked = true;
            
            // Show appropriate section
            if (authMethod === 'entra-id') {
                document.getElementById('entraIdSection').style.display = 'block';
                document.getElementById('apiKeySection').style.display = 'none';
            } else {
                document.getElementById('entraIdSection').style.display = 'none';
                document.getElementById('apiKeySection').style.display = 'block';
                if (credentials.apiKey) {
                    document.getElementById('apiKey').value = credentials.apiKey;
                }
            }
            
            document.getElementById('modelName').value = credentials.modelName;
            document.getElementById('apiEndpoint').value = credentials.apiEndpoint;
        } else {
            // Set defaults
            document.getElementById('apiEndpoint').value = window.CONFIG.DEFAULT_ENDPOINT;
            document.getElementById('modelName').value = window.CONFIG.DEFAULT_MODEL;
        }
        
        // Load Azure AD config if exists
        if (azureConfig) {
            document.getElementById('clientId').value = azureConfig.clientId || '';
            document.getElementById('tenantId').value = azureConfig.tenantId || '';
        }
        
        // Check if already signed in with Azure AD
        if (window.azureAuthManager.isSignedIn()) {
            const account = window.azureAuthManager.getCurrentAccount();
            const signInStatus = document.getElementById('signInStatus');
            if (signInStatus && account) {
                signInStatus.textContent = `✅ Signed in as ${account.username}`;
                signInStatus.style.color = '#28a745';
            }
        }
        
        this.settingsModal.classList.add('show');
        document.getElementById('errorMessage').classList.remove('show');
    }

    closeSettings() {
        this.settingsModal.classList.remove('show');
    }

    saveCredentials() {
        const authMethod = document.querySelector('input[name="authMethod"]:checked').value;
        
        const credentials = {
            authMethod: authMethod,
            modelName: document.getElementById('modelName').value.trim(),
            apiEndpoint: document.getElementById('apiEndpoint').value.trim()
        };
        
        // Add API key if using api-key method
        if (authMethod === 'api-key') {
            credentials.apiKey = document.getElementById('apiKey').value.trim();
        }
        
        // For Entra ID, verify user is signed in
        if (authMethod === 'entra-id') {
            if (!window.azureAuthManager.isSignedIn()) {
                const errorMsg = document.getElementById('errorMessage');
                errorMsg.textContent = 'Please sign in with Microsoft first';
                errorMsg.classList.add('show');
                return;
            }
        }
        
        // Validate
        const validation = window.credentialManager.validateCredentials(credentials);
        if (!validation.valid) {
            const errorMsg = document.getElementById('errorMessage');
            errorMsg.textContent = validation.errors.join('. ');
            errorMsg.classList.add('show');
            return;
        }
        
        // Save
        const saved = window.credentialManager.saveCredentials(credentials);
        if (saved) {
            this.closeSettings();
            this.checkConfiguration();
            this.updateStatus('✅ Configuration saved successfully', 'success');
        } else {
            const errorMsg = document.getElementById('errorMessage');
            errorMsg.textContent = 'Failed to save credentials. Please try again.';
            errorMsg.classList.add('show');
        }
    }

    checkConfiguration() {
        // If using backend mode, no frontend credentials needed
        if (window.CONFIG.AUTH_MODE === 'backend') {
            this.updateStatus('✅ Ready to provide feedback (using backend API)', 'success');
            this.generateButton.disabled = false;
            this.performanceInput.disabled = false;
            return;
        }
        
        // For direct mode, check credentials
        const hasCredentials = window.credentialManager.hasCredentials();
        
        if (!hasCredentials) {
            this.updateStatus('⚙️ Please configure your API credentials', 'error');
            this.generateButton.disabled = true;
            this.performanceInput.disabled = true;
            // Auto-open settings on first load
            setTimeout(() => this.openSettings(), 500);
        } else {
            const credentials = window.credentialManager.getCredentials();
            if (credentials) {
                this.updateStatus('✅ Ready to provide feedback', 'success');
                this.generateButton.disabled = false;
                this.performanceInput.disabled = false;
            } else {
                this.updateStatus('⚠️ Invalid credentials stored. Please reconfigure.', 'error');
                this.generateButton.disabled = true;
                this.performanceInput.disabled = true;
            }
        }
    }

    async handleGenerate() {
        const performanceNotes = this.performanceInput.value.trim();
        const corePriorities = this.corePriorities ? this.corePriorities.value.trim() : '';
        
        if (!performanceNotes) {
            this.updateStatus('Please enter your performance notes', 'error');
            return;
        }

        // Get selected feedback style
        const selectedStyleRadio = document.querySelector('input[name="feedbackStyle"]:checked');
        if (!selectedStyleRadio) {
            this.updateStatus('Please select a feedback style', 'error');
            return;
        }

        const selectedStyle = selectedStyleRadio.value;
        let customPrompt = '';
        
        if (selectedStyle === 'custom') {
            customPrompt = document.getElementById('customPrompt').value.trim();
            if (!customPrompt) {
                this.updateStatus('Please enter your custom feedback instructions', 'error');
                return;
            }
        }

        // Disable generate button while processing
        this.generateButton.disabled = true;
        this.updateStatus('🤔 Generating feedback...', 'loading');
        
        try {
            const feedback = await this.getFeedback(performanceNotes, selectedStyle, customPrompt, corePriorities);
            
            // Show results panel
            this.resultsPanel.style.display = 'flex';
            this.feedbackOutput.innerHTML = this.formatFeedback(feedback);
            
            // Reset scroll position of feedback output to top
            this.feedbackOutput.scrollTop = 0;
            
            this.updateStatus('✅ Feedback generated successfully', 'success');
        } catch (error) {
            console.error('Error generating feedback:', error);
            this.updateStatus(`❌ Error: ${error.message}`, 'error');
        } finally {
            this.generateButton.disabled = false;
        }
    }

    clearResults() {
        // Hide results panel
        this.resultsPanel.style.display = 'none';
        this.feedbackOutput.innerHTML = '';
        this.updateStatus('✅ Ready to provide feedback', 'success');
    }

    resetForm() {
        // Clear everything
        this.performanceInput.value = '';
        this.clearResults();
        
        // Reset to default style
        document.getElementById('styleDefault').checked = true;
        document.getElementById('customPromptArea').style.display = 'none';
        document.getElementById('customPrompt').value = '';
        
        this.updateStatus('✅ Ready to provide feedback', 'success');
    }

    formatFeedback(text) {
        // Convert plain text feedback to formatted HTML
        // Handle bold text markers (**, __)
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
        
        // Handle bullet points and numbered lists
        text = text.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>');
        text = text.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
        
        // Wrap consecutive list items in ul tags
        text = text.replace(/(<li>.*?<\/li>\n?)+/gs, '<ul>$&</ul>');
        
        // Handle line breaks
        text = text.replace(/\n\n/g, '</p><p>');
        text = text.replace(/\n/g, '<br>');
        
        // Wrap in paragraph if not already formatted
        if (!text.startsWith('<')) {
            text = '<p>' + text + '</p>';
        }
        
        return text;
    }

    async getFeedback(performanceNotes, style = 'default', customPrompt = '', corePriorities = '') {
        let systemPrompt;
        
        if (style === 'custom' && customPrompt) {
            systemPrompt = customPrompt;
        } else {
            systemPrompt = this.getSystemPromptForStyle(style);
        }

        // Build user prompt with core priorities and performance notes
        let userPrompt = '';
        if (corePriorities && corePriorities.trim()) {
            userPrompt = `**Core Priorities & Objectives:**\n${corePriorities}\n\n**Performance Notes & Achievements:**\n${performanceNotes}\n\nPlease provide constructive managerial feedback, evaluating how the achievements align with the core priorities. Highlight areas where the employee met or exceeded their objectives, and identify any gaps or opportunities for improvement.`;
        } else {
            // Fallback to original format if no priorities provided
            userPrompt = `Here are the performance notes from an employee:\n\n"${performanceNotes}"\n\nPlease provide constructive managerial feedback.`;
        }

        const requestBody = {
            model: window.CONFIG.DEFAULT_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: window.CONFIG.TEMPERATURE || 0.7,
            max_tokens: window.CONFIG.MAX_TOKENS || 500
        };

        // Check authentication mode
        if (window.CONFIG.AUTH_MODE === 'backend') {
            // Use backend proxy (no authentication needed from frontend)
            return await this.callBackendAPI(requestBody);
        } else {
            // Use direct Azure AD authentication
            return await this.callAzureDirectly(requestBody);
        }
    }

    async callBackendAPI(requestBody) {
        /**
         * Call the backend proxy API
         * Backend handles authentication with Managed Identity
         */
        try {
            const backendUrl = window.CONFIG.BACKEND_API_URL || 'http://localhost:8080/api';
            
            const response = await fetch(`${backendUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Backend API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Backend API error:', error);
            throw new Error(`Failed to connect to backend: ${error.message}`);
        }
    }

    async callAzureDirectly(requestBody) {
        /**
         * Call Azure OpenAI directly with Azure AD authentication
         * Requires user to be signed in via Azure AD
         */
        // Get credentials from secure storage
        const credentials = window.credentialManager.getCredentials();
        if (!credentials) {
            throw new Error('No credentials found. Please configure your API settings.');
        }

        // Prepare headers based on authentication method
        const headers = {
            'Content-Type': 'application/json'
        };

        if (credentials.authMethod === 'api-key') {
            // Use API key authentication
            headers['api-key'] = credentials.apiKey;
        } else if (credentials.authMethod === 'entra-id') {
            // Use Azure Entra ID token authentication
            try {
                const token = await window.azureAuthManager.getAccessToken();
                headers['Authorization'] = `Bearer ${token}`;
            } catch (error) {
                throw new Error(`Authentication failed: ${error.message}. Please sign in again.`);
            }
        } else {
            throw new Error('Invalid authentication method');
        }

        const response = await fetch(credentials.apiEndpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    getSystemPromptForStyle(style) {
        const prompts = {
            default: `You are an experienced and empathetic manager providing constructive feedback to employees. Your role is to:

1. Review the employee's core priorities and objectives, if provided
2. Evaluate how their achievements and performance notes align with those priorities
3. Acknowledge the employee's accomplishments and efforts
4. Identify areas where objectives were met, exceeded, or need more focus
5. Provide specific, actionable feedback
6. Highlight strengths and areas for improvement
7. Offer encouragement and support
8. Suggest concrete next steps or development opportunities
9. Maintain a professional, supportive, and motivating tone

When core priorities are provided, explicitly compare them against the achievements. When they're not provided, focus on the performance notes themselves. Keep your feedback concise (2-3 paragraphs), balanced, and focused on growth. Be specific rather than generic.`,

            concise: `You are a direct and efficient manager. Provide brief, to-the-point feedback that:

1. Quickly assesses alignment between priorities and achievements (if priorities provided)
2. Identifies key strengths
3. Highlights 1-2 main areas for improvement or gaps
4. Gives one clear action item

Keep it under 150 words. Be direct but respectful.`,

            detailed: `You are a developmental coach providing comprehensive feedback. Your detailed analysis should:

1. Thoroughly compare core priorities against actual achievements (if priorities provided)
2. Identify which objectives were met, exceeded, or missed
3. Examine all aspects of the performance notes with specific examples
4. Provide context for observations about alignment and gaps
5. Offer multiple development strategies and resources
6. Create a structured improvement plan with timelines
7. Address both technical and soft skills
8. Suggest mentorship or training opportunities

Provide 3-4 paragraphs with actionable, detailed guidance that links back to stated priorities.`,

            strength: `You are an appreciative and encouraging manager. Focus on:

1. Celebrating how achievements aligned with or exceeded core priorities
2. Highlighting accomplishments and positive contributions
3. Recognizing specific strengths demonstrated
4. Connecting strengths to organizational value and stated objectives
5. Encouraging continued excellence
6. Suggesting ways to leverage strengths further

Be enthusiastic and specific about what was done well and how it met objectives. Keep tone uplifting and motivating.`,

            improvement: `You are a growth-oriented coach. Provide constructive feedback that:

1. Identifies gaps between core priorities and achievements (if priorities provided)
2. Explains specific areas needing development
3. Clarifies why these areas matter for meeting objectives
4. Provides concrete learning strategies
5. Suggests resources, training, or mentorship
6. Sets realistic improvement goals aligned with priorities
7. Offers encouragement for growth

Be honest but supportive. Focus on learning and development opportunities that will help achieve core objectives.`
        };
        
        return prompts[style] || prompts.default;
    }

    updateStatus(message, type = '') {
        this.statusText.textContent = message;
        this.statusText.className = 'status-text' + (type ? ' ' + type : '');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FeedbackManager();
});
