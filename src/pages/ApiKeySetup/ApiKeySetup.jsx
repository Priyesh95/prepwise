import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiKey } from '../../context/ApiKeyContext/ApiKeyContext'
import { validateApiKeyFormat } from '../../utils/encryption'
import Container from '../../components/layout/Container/Container'
import Button from '../../components/common/Button/Button'
import Card from '../../components/common/Card/Card'
import './ApiKeySetup.css'

function ApiKeySetup() {
  const navigate = useNavigate()
  const { saveApiKey, hasApiKey } = useApiKey()

  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [showKey, setShowKey] = useState(false)

  // Redirect if already has key
  if (hasApiKey()) {
    navigate('/dashboard')
    return null
  }

  const handleValidateAndSave = async () => {
    setError('')

    // Basic format validation
    if (!validateApiKeyFormat(key)) {
      setError('Invalid API key format. Claude API keys start with "sk-ant-api03-"')
      return
    }

    // Save the key without API validation (CORS limitation for frontend-only apps)
    // The key will be validated when first used for question generation
    saveApiKey(key)
    navigate('/dashboard')
  }

  return (
    <div className="api-key-setup">
      <Container narrow>
        <Card>
          <div className="api-key-setup__content">
            {/* Header */}
            <div className="api-key-setup__header">
              <h1>Setup Your API Key</h1>
              <p className="subtitle">
                To use PrepWise, you need a Claude API key from Anthropic.
              </p>
            </div>

            {/* Instructions */}
            <div className="instructions">
              <h3>How to get your API key:</h3>
              <ol className="instructions__list">
                <li>Visit <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="link">console.anthropic.com</a></li>
                <li>Sign up for an account (free $5 credit)</li>
                <li>Navigate to "API Keys"</li>
                <li>Click "Create Key"</li>
                <li>Copy and paste it below</li>
              </ol>

              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="external-link"
              >
                Open Anthropic Console →
              </a>
            </div>

            {/* Cost Info */}
            <div className="cost-info">
              <h4>💰 Cost Information</h4>
              <ul>
                <li>~$0.02 to generate questions from PDF</li>
                <li>~$0.01 per quiz taken</li>
                <li>Total: ~$0.03 per study session</li>
                <li><strong>Your $5 credit = 150+ study sessions!</strong></li>
              </ul>
            </div>

            {/* API Key Input */}
            <div className="api-key-input-group">
              <label htmlFor="api-key" className="label">
                Enter your Claude API key:
              </label>
              <div className="input-wrapper">
                <input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className={`input ${error ? 'input--error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="toggle-visibility"
                >
                  {showKey ? '🙈 Hide' : '👁️ Show'}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <p className="error-message">{error}</p>
              )}

              <label className="checkbox-label">
                <input type="checkbox" checked readOnly />
                <span>I understand my key is stored locally and never shared</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={handleValidateAndSave}
              disabled={!key}
            >
              Save Key & Continue
            </Button>

            {/* Security Note */}
            <div className="security-note">
              <p>
                🔒 Your API key is stored locally in your browser and never
                sent to our servers. You have full control and can delete it
                anytime from Settings.
              </p>
              <p>
                ℹ️ Your API key will be validated when you generate your first quiz.
                If there's an issue, you'll be notified at that time.
              </p>
            </div>

            {/* Skip Option */}
            <div className="skip-option">
              <button
                onClick={() => navigate('/dashboard')}
                className="skip-link"
              >
                Skip for now - I'll add it later
              </button>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  )
}

export default ApiKeySetup
