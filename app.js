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

        // Show feedback style selector
        this.showFeedbackStyleSelector(message);
    }

    showFeedbackStyleSelector(performanceNotes) {
        // Create style selector modal
        const selectorDiv = document.createElement('div');
        selectorDiv.className = 'feedback-style-selector';
        selectorDiv.innerHTML = `
            <div class="style-selector-content">
                <h3>Choose Feedback Style</h3>
                <p class="selector-description">How would you like to receive feedback on your performance notes?</p>
                
                <div class="style-options">
                    <label class="style-option">
                        <input type="radio" name="feedbackStyle" value="default" checked>
                        <div class="option-content">
                            <strong>🎯 Default Manager Feedback</strong>
                            <small>Balanced, constructive feedback with acknowledgments and growth suggestions</small>
                        </div>
                    </label>
                    
                    <label class="style-option">
                        <input type="radio" name="feedbackStyle" value="concise">
                        <div class="option-content">
                            <strong>⚡ Concise & Direct</strong>
                            <small>Brief, to-the-point feedback focusing on key areas</small>
                        </div>
                    </label>
                    
                    <label class="style-option">
                        <input type="radio" name="feedbackStyle" value="detailed">
                        <div class="option-content">
                            <strong>📊 Detailed & Developmental</strong>
                            <small>In-depth analysis with specific development recommendations</small>
                        </div>
                    </label>
                    
                    <label class="style-option">
                        <input type="radio" name="feedbackStyle" value="strength">
                        <div class="option-content">
                            <strong>💪 Strength-Focused</strong>
                            <small>Emphasize strengths and positive contributions</small>
                        </div>
                    </label>
                    
                    <label class="style-option">
                        <input type="radio" name="feedbackStyle" value="improvement">
                        <div class="option-content">
                            <strong>🎓 Growth & Improvement</strong>
                            <small>Focus on areas for improvement and learning opportunities</small>
                        </div>
                    </label>
                    
                    <label class="style-option">
                        <input type="radio" name="feedbackStyle" value="custom">
                        <div class="option-content">
                            <strong>✏️ Custom Prompt</strong>
                            <small>Write your own feedback instructions</small>
                        </div>
                    </label>
                </div>
                
                <div id="customPromptArea" class="custom-prompt-area" style="display: none;">
                    <label for="customPrompt">Custom Feedback Instructions:</label>
                    <textarea 
                        id="customPrompt" 
                        class="custom-prompt-input" 
                        placeholder="Example: Provide feedback as if you're a senior technical lead, focusing on technical skills and code quality..."
                        rows="4"
                    ></textarea>
                </div>
                
                <div class="selector-actions">
                    <button type="button" class="btn btn-secondary" id="cancelStyle">Cancel</button>
                    <button type="button" class="btn btn-primary" id="generateFeedback">Generate Feedback</button>
                </div>
            </div>
        `;
        
        this.messagesArea.appendChild(selectorDiv);
        this.scrollToBottom();
        
        // Handle custom prompt toggle
        const customRadio = selectorDiv.querySelector('input[value="custom"]');
        const customPromptArea = selectorDiv.querySelector('#customPromptArea');
        const allRadios = selectorDiv.querySelectorAll('input[name="feedbackStyle"]');
        
        allRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'custom') {
                    customPromptArea.style.display = 'block';
                } else {
                    customPromptArea.style.display = 'none';
                }
            });
        });
        
        // Handle generate button
        const generateBtn = selectorDiv.querySelector('#generateFeedback');
        generateBtn.addEventListener('click', async () => {
            const selectedStyle = selectorDiv.querySelector('input[name="feedbackStyle"]:checked').value;
            let customPrompt = '';
            
            if (selectedStyle === 'custom') {
                customPrompt = selectorDiv.querySelector('#customPrompt').value.trim();
                if (!customPrompt) {
                    alert('Please enter your custom feedback instructions');
                    return;
                }
            }
            
            // Remove selector
            selectorDiv.remove();
            
            // Disable input while processing
            this.setInputState(false);
            
            // Display user message
            this.addMessage(performanceNotes, 'user');
            
            // Clear input
            this.userInput.value = '';
            this.userInput.style.height = 'auto';
            
            // Show loading indicator
            const loadingId = this.showLoading();
            
            try {
                // Get feedback from LLM with selected style
                const feedback = await this.getFeedback(performanceNotes, selectedStyle, customPrompt);
                
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
        });
        
        // Handle cancel button
        const cancelBtn = selectorDiv.querySelector('#cancelStyle');
        cancelBtn.addEventListener('click', () => {
            selectorDiv.remove();
            this.updateStatus('Feedback cancelled', '');
        });
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
