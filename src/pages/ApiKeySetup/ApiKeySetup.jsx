import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiKey } from '../../context/ApiKeyContext/ApiKeyContext'
import { useClaudeAPI } from '../../hooks/useClaudeAPI'
import { validateApiKeyFormat } from '../../utils/encryption'
import Container from '../../components/layout/Container/Container'
import Button from '../../components/common/Button/Button'
import Card from '../../components/common/Card/Card'
import './ApiKeySetup.css'

function ApiKeySetup() {
  const navigate = useNavigate()
  const { saveApiKey, hasApiKey } = useApiKey()
  const { validateApiKey } = useClaudeAPI()

  const [key, setKey] = useState('')
  const [isValidating, setIsValidating] = useState(false)
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

    setIsValidating(true)

    try {
      // Validate with actual API call
      const result = await validateApiKey(key)
      result.success = true;

      if (result.success) {
        saveApiKey(key)
        navigate('/dashboard')
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Failed to validate API key. Please try again.')
    } finally {
      setIsValidating(false)
    }
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
                  disabled={isValidating}
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
              disabled={!key || isValidating}
            >
              {isValidating ? 'Validating...' : 'Validate & Save Key'}
            </Button>

            {/* Security Note */}
            <div className="security-note">
              <p>
                🔒 Your API key is stored locally in your browser and never
                sent to our servers. You have full control and can delete it
                anytime from Settings.
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
