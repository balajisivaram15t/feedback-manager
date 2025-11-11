// Main application logic
class FeedbackManager {
    constructor() {
        this.messagesArea = document.getElementById('messagesArea');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.statusText = document.getElementById('statusText');
        
        this.initializeEventListeners();
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
    }

    checkConfiguration() {
        if (!window.CONFIG || !window.CONFIG.API_KEY) {
            this.updateStatus('⚠️ Please configure your API key in config.js', 'error');
            this.sendButton.disabled = true;
        } else if (!window.CONFIG.MODEL_NAME) {
            this.updateStatus('⚠️ Please configure your model name in config.js', 'error');
            this.sendButton.disabled = true;
        } else {
            this.updateStatus('✅ Ready to provide feedback', 'success');
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

        // Determine API endpoint based on configuration
        const apiEndpoint = window.CONFIG.API_ENDPOINT || this.getDefaultEndpoint();
        
        const requestBody = {
            model: window.CONFIG.MODEL_NAME,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 500
        };

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.CONFIG.API_KEY}`
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

    getDefaultEndpoint() {
        // Default to OpenAI-compatible endpoint
        // Users can override this in config.js
        return 'https://api.openai.com/v1/chat/completions';
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
