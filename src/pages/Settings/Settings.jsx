import { useState } from 'react'
import { useApiKey } from '../../context/ApiKeyContext/ApiKeyContext'
import Container from '../../components/layout/Container/Container'
import Card from '../../components/common/Card/Card'
import Button from '../../components/common/Button/Button'
import './Settings.css'

function Settings() {
  const { hasApiKey, clearApiKey, getApiKey } = useApiKey()
  const [showKey, setShowKey] = useState(false)

  const handleClearKey = () => {
    if (window.confirm('Are you sure you want to remove your API key? You will need to add it again to use PrepWise.')) {
      clearApiKey()
      alert('API key removed successfully!')
    }
  }

  const maskedKey = () => {
    const key = getApiKey()
    if (!key) return ''
    return key.substring(0, 20) + '...' + key.substring(key.length - 4)
  }

  return (
    <div className="settings">
      <Container narrow>
        <h1>Settings</h1>

        <Card>
          <div className="settings__section">
            <h3>API Key Management</h3>

            {hasApiKey() ? (
              <>
                <p className="settings__description">
                  Your Claude API key is configured and ready to use.
                </p>

                <div className="key-display">
                  <label className="label">Current API Key:</label>
                  <div className="key-value">
                    {showKey ? getApiKey() : maskedKey()}
                  </div>
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="toggle-key-btn"
                  >
                    {showKey ? 'Hide Key' : 'Show Key'}
                  </button>
                </div>

                <Button
                  variant="secondary"
                  onClick={handleClearKey}
                >
                  Remove API Key
                </Button>
              </>
            ) : (
              <>
                <p className="settings__description">
                  No API key configured. You need an API key to use PrepWise.
                </p>

                <Button
                  variant="primary"
                  onClick={() => window.location.href = '/api-setup'}
                >
                  Add API Key
                </Button>
              </>
            )}
          </div>
        </Card>
      </Container>
    </div>
  )
}

export default Settings
