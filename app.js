// Main application logic
class FeedbackManager {
    constructor() {
        this.messagesArea = document.getElementById('messagesArea');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.statusText = document.getElementById('statusText');
        this.settingsButton = document.getElementById('settingsButton');
        this.settingsModal = document.getElementById('settingsModal');
        
        this.initializeEventListeners();
        this.initializeSettingsModal();
        this.checkConfiguration();
    }

    initializeEventListeners() {
        // Send button click
        this.sendButton.addEventListener('click', () => this.handleSend());
        
        // Enter key to send (Ctrl+Enter)
        this.userInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.handleSend();
            }
        });

        // Auto-resize textarea
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = this.userInput.scrollHeight + 'px';
        });

        // Settings button
        this.settingsButton.addEventListener('click', () => this.openSettings());
    }

    initializeSettingsModal() {
        const closeModal = document.getElementById('closeModal');
        const credentialsForm = document.getElementById('credentialsForm');
        const toggleApiKey = document.getElementById('toggleApiKey');
        const clearCredentials = document.getElementById('clearCredentials');
        
        // Close modal
        closeModal.addEventListener('click', () => this.closeSettings());
        
        // Close on outside click
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });
        
        // Toggle API key visibility
        toggleApiKey.addEventListener('click', () => {
            const apiKeyInput = document.getElementById('apiKey');
            apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
            toggleApiKey.textContent = apiKeyInput.type === 'password' ? '👁️' : '🙈';
        });
        
        // Clear credentials
        clearCredentials.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all stored credentials?')) {
                window.credentialManager.clearCredentials();
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

    openSettings() {
        // Load existing credentials if any
        const credentials = window.credentialManager.getCredentials();
        if (credentials) {
            document.getElementById('apiKey').value = credentials.apiKey;
            document.getElementById('modelName').value = credentials.modelName;
            document.getElementById('apiEndpoint').value = credentials.apiEndpoint;
        } else {
            // Set defaults
            document.getElementById('apiEndpoint').value = window.CONFIG.DEFAULT_ENDPOINT;
            document.getElementById('modelName').value = window.CONFIG.DEFAULT_MODEL;
        }
        
        this.settingsModal.classList.add('show');
        document.getElementById('errorMessage').classList.remove('show');
    }

    closeSettings() {
        this.settingsModal.classList.remove('show');
    }

    saveCredentials() {
        const credentials = {
            apiKey: document.getElementById('apiKey').value.trim(),
            modelName: document.getElementById('modelName').value.trim(),
            apiEndpoint: document.getElementById('apiEndpoint').value.trim()
        };
        
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
            this.updateStatus('✅ Credentials saved successfully', 'success');
        } else {
            const errorMsg = document.getElementById('errorMessage');
            errorMsg.textContent = 'Failed to save credentials. Please try again.';
            errorMsg.classList.add('show');
        }
    }

    checkConfiguration() {
        const hasCredentials = window.credentialManager.hasCredentials();
        
        if (!hasCredentials) {
            this.updateStatus('⚙️ Please configure your API credentials', 'error');
            this.sendButton.disabled = true;
            this.userInput.disabled = true;
            // Auto-open settings on first load
            setTimeout(() => this.openSettings(), 500);
        } else {
            const credentials = window.credentialManager.getCredentials();
            if (credentials) {
                this.updateStatus('✅ Ready to provide feedback', 'success');
                this.sendButton.disabled = false;
                this.userInput.disabled = false;
            } else {
                this.updateStatus('⚠️ Invalid credentials stored. Please reconfigure.', 'error');
                this.sendButton.disabled = true;
                this.userInput.disabled = true;
            }
        }
    }

    async handleSend() {
        const message = this.userInput.value.trim();
        
        if (!message) {
            this.updateStatus('Please enter your performance notes', 'error');
            return;
        }

        // Disable input while processing
        this.setInputState(false);
        
        // Display user message
        this.addMessage(message, 'user');
        
        // Clear input
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        
        // Show loading indicator
        const loadingId = this.showLoading();
        
        try {
            // Get feedback from LLM
            const feedback = await this.getFeedback(message);
            
            // Remove loading and show response
            this.removeLoading(loadingId);
            this.addMessage(feedback, 'assistant');
            
            this.updateStatus('Feedback provided', 'success');
        } catch (error) {
            this.removeLoading(loadingId);
            this.addMessage('Sorry, I encountered an error while generating feedback. Please check your API configuration and try again.', 'assistant');
            this.updateStatus(`Error: ${error.message}`, 'error');
            console.error('Error:', error);
        } finally {
            this.setInputState(true);
        }
    }

    async getFeedback(performanceNotes) {
        const systemPrompt = `You are an experienced and empathetic manager providing constructive feedback to employees. Your role is to:

1. Acknowledge the employee's accomplishments and efforts
2. Provide specific, actionable feedback
3. Highlight strengths and areas for improvement
4. Offer encouragement and support
5. Suggest concrete next steps or development opportunities
6. Maintain a professional, supportive, and motivating tone

Keep your feedback concise (2-3 paragraphs), balanced, and focused on growth. Be specific rather than generic.`;

        const userPrompt = `Here are the performance notes from an employee:\n\n"${performanceNotes}"\n\nPlease provide constructive managerial feedback.`;

        // Get credentials from secure storage
        const credentials = window.credentialManager.getCredentials();
        if (!credentials) {
            throw new Error('No credentials found. Please configure your API settings.');
        }
        
        const requestBody = {
            model: credentials.modelName,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: window.CONFIG.TEMPERATURE || 0.7,
            max_tokens: window.CONFIG.MAX_TOKENS || 500
        };

        const response = await fetch(credentials.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${credentials.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    addMessage(content, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const roleLabel = role === 'user' ? 'You' : 'Manager Feedback';
        
        messageDiv.innerHTML = `
            <div class="message-role">${roleLabel}</div>
            <div class="message-content">${this.escapeHtml(content)}</div>
        `;
        
        this.messagesArea.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showLoading() {
        const loadingId = 'loading-' + Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.id = loadingId;
        loadingDiv.className = 'message assistant-message';
        loadingDiv.innerHTML = `
            <div class="message-role">Manager Feedback</div>
            <div class="loading">
                <span>Analyzing your performance notes</span>
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.messagesArea.appendChild(loadingDiv);
        this.scrollToBottom();
        return loadingId;
    }

    removeLoading(loadingId) {
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    setInputState(enabled) {
        this.userInput.disabled = !enabled;
        this.sendButton.disabled = !enabled;
        if (enabled) {
            this.userInput.focus();
        }
    }

    updateStatus(message, type = '') {
        this.statusText.textContent = message;
        this.statusText.className = 'status-text' + (type ? ' ' + type : '');
    }

    scrollToBottom() {
        this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
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
