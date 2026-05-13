# 🎯 Performance Feedback Manager

An AI-powered application that provides constructive managerial feedback on employee performance notes. Now with **Azure Managed Identity support** for enterprise-grade security!

## ✨ Features

- **Clean, Professional UI**: Modern interface designed for professional use
- **AI-Powered Feedback**: Powered by Azure OpenAI (gpt-4.1)
- **Multiple Feedback Styles**: Choose from 5 pre-configured styles or create custom prompts
- **Manager Perspective**: Provides constructive, actionable feedback from a managerial viewpoint
- **Secure Authentication**: 
  - Backend proxy with **Azure Managed Identity** (recommended)
  - Azure Entra ID (Azure AD) authentication
  - API Key authentication (if enabled)
- **Responsive Design**: Works on desktop and mobile devices
- **Privacy-Focused**: Enterprise-grade security with Azure RBAC

## 🏗️ Architecture

### Option 1: Backend Proxy with Managed Identity (Recommended) ⭐

```
User Browser → Frontend (HTML/JS) → Backend (Python Flask) → Azure OpenAI
                                      ↑
                                Managed Identity
```

**Benefits:**
- ✅ No user authentication required
- ✅ No API keys exposed
- ✅ Managed Identity handles all auth
- ✅ Easy to share - just send the URL!
- ✅ Centralized access control

### Option 2: Direct Azure AD Authentication

```
User Browser → Frontend (HTML/JS) → Azure AD Login → Azure OpenAI
```

**Benefits:**
- ✅ User-level authentication
- ✅ Individual audit trails
- ✅ No backend needed

## 🚀 Quick Start

### For Users (Production)

If your admin has deployed this to Azure App Service:

1. **Open the URL** provided by your admin
2. **Enter performance notes** in the text area
3. **Select feedback style**
4. **Click "Generate Feedback"**
5. Done! No login or setup required ✨

### For Developers/Admins

See detailed setup guides:

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Deploy backend to Azure App Service with Managed Identity
- **[AZURE_AUTH_SETUP.md](AZURE_AUTH_SETUP.md)** - Setup Azure AD authentication (alternative approach)

## 🛠️ Local Development

### Test Backend Locally

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Login to Azure
az login

# Run backend
python app.py
```

Backend runs on `http://localhost:8080`

### Test Frontend Locally

1. Open `config.js` and ensure:
```javascript
AUTH_MODE: 'backend',  // Use backend proxy
BACKEND_API_URL: 'http://localhost:8080/api'
```

2. Open `index.html` in your browser

3. Enter performance notes and generate feedback!

## 📁 Files Structure

```
meera-ask/
├── backend/
│   ├── app.py              # Flask API with Managed Identity
│   ├── requirements.txt    # Python dependencies
│   ├── startup.txt         # Azure App Service startup
│   └── README.md          # Backend documentation
├── index.html             # Frontend structure
├── styles.css            # Styling and layout
├── app.js               # Frontend logic
├── config.js            # Configuration (backend URL, auth mode)
├── auth.js              # Azure AD authentication (optional)
├── credentials.js       # Credential manager
├── DEPLOYMENT_GUIDE.md  # Azure deployment instructions
└── README.md           # This file
```

## 🔐 Authentication Modes

Configure in `config.js`:

### Mode 1: Backend Proxy (Default)
```javascript
AUTH_MODE: 'backend',
BACKEND_API_URL: 'https://your-app.azurewebsites.net/api'
```
- Users access the app - no login needed
- Backend uses Managed Identity

### Mode 2: Direct Azure AD
```javascript
AUTH_MODE: 'direct'
```
- Users sign in with Microsoft account
- Requires App Registration setup

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
