import { useApiKey } from '../context/ApiKeyContext/ApiKeyContext'

export function useClaudeAPI() {
  const { getApiKey } = useApiKey()

  // Validate API key with test call
  const validateApiKey = async (key) => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 10,
          messages: [
            {
              role: 'user',
              content: 'test'
            }
          ]
        })
      })

      if (response.ok) {
        return { success: true }
      } else {
        const error = await response.json()
        return {
          success: false,
          error: error.error?.message || 'Invalid API key'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to validate API key. Please check your connection.'
      }
    }
  }

  // Main API call function
  const callClaude = async (prompt, systemPrompt = '', maxTokens = 4000) => {
    const key = getApiKey()

    if (!key) {
      throw new Error('API key not configured')
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'API call failed')
      }

      const data = await response.json()
      return data.content[0].text
    } catch (error) {
      console.error('Claude API Error:', error)
      throw error
    }
  }

  return {
    validateApiKey,
    callClaude
  }
}
