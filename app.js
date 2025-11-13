// Main application logic
class FeedbackManager {
    constructor() {
        this.performanceInput = document.getElementById('performanceInput');
        this.generateButton = document.getElementById('generateButton');
        this.statusText = document.getElementById('statusText');
        this.settingsButton = document.getElementById('settingsButton');
        this.settingsModal = document.getElementById('settingsModal');
        this.resultsPanel = document.getElementById('resultsPanel');
        this.feedbackOutput = document.getElementById('feedbackOutput');
        this.clearResultsButton = document.getElementById('clearResultsButton');
        
        this.initializeEventListeners();
        this.initializeSettingsModal();
        this.checkConfiguration();
    }

    initializeEventListeners() {
        // Generate button click
        this.generateButton.addEventListener('click', () => this.handleGenerate());
        
        // Clear results button click
        this.clearResultsButton.addEventListener('click', () => this.clearResults());
        
        // Settings button
        this.settingsButton.addEventListener('click', () => this.openSettings());
        
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
            const feedback = await this.getFeedback(performanceNotes, selectedStyle, customPrompt);
            
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

    async getFeedback(performanceNotes, style = 'default', customPrompt = '') {
        let systemPrompt;
        
        if (style === 'custom' && customPrompt) {
            systemPrompt = customPrompt;
        } else {
            systemPrompt = this.getSystemPromptForStyle(style);
        }

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

    getSystemPromptForStyle(style) {
        const prompts = {
            default: `You are an experienced and empathetic manager providing constructive feedback to employees. Your role is to:

1. Acknowledge the employee's accomplishments and efforts
2. Provide specific, actionable feedback
3. Highlight strengths and areas for improvement
4. Offer encouragement and support
5. Suggest concrete next steps or development opportunities
6. Maintain a professional, supportive, and motivating tone

Keep your feedback concise (2-3 paragraphs), balanced, and focused on growth. Be specific rather than generic.`,

            concise: `You are a direct and efficient manager. Provide brief, to-the-point feedback that:

1. Quickly identifies key strengths
2. Highlights 1-2 main areas for improvement
3. Gives one clear action item

Keep it under 150 words. Be direct but respectful.`,

            detailed: `You are a developmental coach providing comprehensive feedback. Your detailed analysis should:

1. Thoroughly examine all aspects of the performance notes
2. Provide specific examples and context for observations
3. Offer multiple development strategies and resources
4. Create a structured improvement plan with timelines
5. Address both technical and soft skills
6. Suggest mentorship or training opportunities

Provide 3-4 paragraphs with actionable, detailed guidance.`,

            strength: `You are an appreciative and encouraging manager. Focus on:

1. Celebrating accomplishments and positive contributions
2. Highlighting specific strengths demonstrated
3. Connecting strengths to organizational value
4. Encouraging continued excellence
5. Suggesting ways to leverage strengths further

Be enthusiastic and specific about what was done well. Keep tone uplifting and motivating.`,

            improvement: `You are a growth-oriented coach. Provide constructive feedback that:

1. Identifies specific areas needing development
2. Explains why these areas matter
3. Provides concrete learning strategies
4. Suggests resources, training, or mentorship
5. Sets realistic improvement goals
6. Offers encouragement for growth

Be honest but supportive. Focus on learning and development opportunities.`
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
