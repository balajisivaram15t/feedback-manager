# 🎯 Performance Feedback Manager

An AI-powered chatbot that acts as a manager to provide constructive feedback on employee performance notes. Built with HTML, CSS, and JavaScript for simplicity and ease of use.

## ✨ Features

- **Clean, Professional UI**: Modern chat interface designed for professional use
- **AI-Powered Feedback**: Integrates with LLM models (OpenAI, Azure OpenAI, or compatible APIs)
- **Manager Perspective**: Provides constructive, actionable feedback from a managerial viewpoint
- **Responsive Design**: Works on desktop and mobile devices
- **Easy Configuration**: Simple config file for API setup
- **Privacy-Focused**: All processing happens through your configured API

## 🚀 Quick Start

### 1. Configure Your API

Open `config.js` and update the following:

```javascript
window.CONFIG = {
    API_KEY: 'your-api-key-here',        // Your LLM API key
    MODEL_NAME: 'gpt-3.5-turbo',         // Model to use
    API_ENDPOINT: '...'                   // API endpoint (optional)
};
```

#### For OpenAI:
```javascript
API_KEY: 'sk-...',  // Get from https://platform.openai.com/api-keys
MODEL_NAME: 'gpt-3.5-turbo',  // or 'gpt-4', 'gpt-4-turbo'
API_ENDPOINT: 'https://api.openai.com/v1/chat/completions'
```

#### For Azure OpenAI:
```javascript
API_KEY: 'your-azure-api-key',
MODEL_NAME: 'your-deployment-name',
API_ENDPOINT: 'https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2024-02-15-preview'
```

#### For Other Providers:
Configure according to their OpenAI-compatible API specifications.

### 2. Open the Application

Simply open `index.html` in your web browser:
- Double-click the file, or
- Right-click and select "Open with Browser", or
- Use a local server (recommended for development)

### 3. Use the Chatbot

1. Enter employee performance notes in the text area
2. Click "Get Feedback" or press `Ctrl+Enter`
3. Receive AI-powered managerial feedback

## 📝 Example Inputs

**Achievement-focused:**
```
Completed 5 major projects this quarter, all delivered on time. 
Led the migration to the new platform successfully.
```

**Challenge-focused:**
```
Struggled with meeting deadlines on the last two sprints. 
Had difficulty coordinating with the remote team members.
```

**Mixed performance:**
```
Improved code quality by implementing automated testing. 
However, missed the Q3 target for customer feature requests.
Collaborated well with design team on the new UI.
```

## 🛠️ Technical Details

### Files Structure
```
meera-ask/
├── index.html       # Main HTML structure
├── styles.css       # Styling and layout
├── app.js          # Application logic and API integration
├── config.js       # Configuration file (API key, model)
└── README.md       # This file
```

### Technology Stack
- **HTML5**: Structure
- **CSS3**: Modern styling with animations
- **Vanilla JavaScript**: No dependencies required
- **LLM API**: OpenAI-compatible chat completion API

### Features Implementation
- Real-time chat interface
- Async/await API calls
- Error handling and status updates
- Responsive design (mobile-friendly)
- Loading indicators
- Auto-scrolling messages

## 🔒 Security Notes

**⚠️ IMPORTANT:** This is a client-side application that exposes your API key in the browser.

**For Production Use:**
- **Never commit `config.js` with real API keys to version control**
- Add `config.js` to `.gitignore`
- Consider implementing a backend proxy to keep API keys secure
- Use environment variables or secure secret management
- Implement rate limiting and authentication

**For Development/Testing:**
- Use API keys with limited permissions and rate limits
- Monitor your API usage regularly

## 🎨 Customization

### Change the System Prompt
Edit the `systemPrompt` in `app.js` (line ~77) to modify the manager's personality and feedback style.

### Adjust Styling
Modify CSS variables in `styles.css` (lines 7-20) to change colors, fonts, and spacing.

### Add Features
The modular structure makes it easy to add:
- Conversation history
- Export feedback functionality
- Multiple feedback styles
- Custom prompts or templates

## 📊 Supported LLM Providers

This application works with any OpenAI-compatible API:

✅ OpenAI (GPT-3.5, GPT-4, GPT-4 Turbo)  
✅ Azure OpenAI Service  
✅ OpenRouter  
✅ Anthropic Claude (via compatible wrapper)  
✅ Local LLMs (via OpenAI-compatible servers like LM Studio, Ollama with OpenAI plugin)  
✅ Other OpenAI-compatible APIs

## 🐛 Troubleshooting

### "Please configure your API key"
- Check that `config.js` has your actual API key
- Ensure the file is loaded properly (check browser console)

### "API request failed"
- Verify your API key is valid and active
- Check that the model name is correct
- Ensure you have API credits/quota available
- Verify the API endpoint URL is correct

### CORS Errors
- Some API providers require backend proxying
- Consider using a local server or backend service
- Check API provider's CORS policies

### No Response
- Open browser Developer Tools (F12) and check the Console for errors
- Verify network connectivity
- Check API status pages

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Feel free to fork, modify, and improve this application. Some ideas:
- Add conversation export
- Implement feedback templates
- Add multi-language support
- Create backend proxy service
- Add user authentication

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review your API provider's documentation
3. Check browser console for error messages

---

**Built with ❤️ for better performance management**
