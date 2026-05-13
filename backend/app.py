"""
Performance Feedback Manager - Backend API
Azure App Service backend with Managed Identity authentication
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from azure.identity import DefaultAzureCredential
import requests
import os
import logging

app = Flask(__name__)

# Enable CORS for frontend access
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],  # In production, replace with your frontend domain
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Azure OpenAI Configuration from environment variables
AZURE_OPENAI_ENDPOINT = os.getenv('AZURE_OPENAI_ENDPOINT', 
    'https://testaimodel-sbal.services.ai.azure.com/openai/deployments/gpt-4.1/chat/completions?api-version=2024-10-21')
AZURE_OPENAI_MODEL = os.getenv('AZURE_OPENAI_MODEL', 'gpt-4.1')

# Initialize Azure credential (uses Managed Identity in Azure, Azure CLI locally)
# DefaultAzureCredential automatically tries Managed Identity first, then falls back to Azure CLI
credential = DefaultAzureCredential()
logger.info("Azure credential initialized (will use Managed Identity in Azure, Azure CLI locally)")

def get_access_token():
    """Get Azure access token for Cognitive Services"""
    try:
        token = credential.get_token("https://cognitiveservices.azure.com/.default")
        return token.token
    except Exception as e:
        logger.error(f"Failed to get access token: {str(e)}")
        raise

@app.route('/', methods=['GET'])
def root():
    """Root endpoint - redirect to API docs"""
    return jsonify({
        'message': 'Performance Feedback Manager API',
        'version': '1.0.0',
        'endpoints': {
            'health': '/api/health',
            'chat': '/api/chat/completions',
            'config': '/api/config'
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Performance Feedback Manager API',
        'version': '1.0.0'
    })

@app.route('/api/chat/completions', methods=['POST', 'OPTIONS'])
def chat_completions():
    """
    Proxy endpoint for Azure OpenAI chat completions
    Accepts the same request format as OpenAI API
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # Get request data from frontend
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No request data provided'}), 400
        
        logger.info(f"Received chat completion request")
        
        # Get access token
        access_token = get_access_token()
        
        # Prepare headers
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_token}'
        }
        
        # Forward request to Azure OpenAI
        response = requests.post(
            AZURE_OPENAI_ENDPOINT,
            headers=headers,
            json=data,
            timeout=60
        )
        
        # Check response
        if response.status_code != 200:
            logger.error(f"Azure OpenAI API error: {response.status_code} - {response.text}")
            return jsonify({
                'error': f'Azure OpenAI API error: {response.status_code}',
                'details': response.text
            }), response.status_code
        
        # Return the response
        return jsonify(response.json()), 200
        
    except Exception as e:
        logger.error(f"Error in chat_completions: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/api/config', methods=['GET'])
def get_config():
    """Get backend configuration (for debugging)"""
    return jsonify({
        'endpoint': AZURE_OPENAI_ENDPOINT,
        'model': AZURE_OPENAI_MODEL,
        'auth_method': 'Managed Identity'
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
