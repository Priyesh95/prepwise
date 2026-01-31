import { useApiKey } from '../context/ApiKeyContext/ApiKeyContext'

// Get API endpoint from environment variable
// If not set, falls back to direct Anthropic API (will have CORS issues)
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || 'https://api.anthropic.com/v1/messages'

export function useClaudeAPI() {
  const { getApiKey } = useApiKey()

  // Validate API key with test call
  const validateApiKey = async (key) => {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
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

  // Helper function to delay execution
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  // Main API call function with retry logic
  const callClaude = async (prompt, systemPrompt = '', maxTokens = 4000, retries = 3) => {
    const key = getApiKey()

    if (!key) {
      throw new Error('API key not configured. Please add your API key in Settings.')
    }

    let lastError = null

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Add delay between retries (exponential backoff)
        if (attempt > 0) {
          const delayMs = Math.min(1000 * Math.pow(2, attempt), 10000) // Max 10s
          console.log(`Retry attempt ${attempt + 1}/${retries} after ${delayMs}ms delay...`)
          await delay(delayMs)
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s timeout

        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ]
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        try {
          const error = JSON.parse(errorText)
          throw new Error(error.error?.message || 'API call failed')
        } catch (e) {
          throw new Error(`API call failed: ${response.status} ${response.statusText}`)
        }
      }

      const responseText = await response.text()
      console.log('API Response (first 500 chars):', responseText.substring(0, 500))

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse API response:', parseError)
        console.error('Full response:', responseText)
        throw new Error('Invalid JSON response from API. The response may be incomplete.')
      }

      if (!data.content || !data.content[0] || !data.content[0].text) {
        console.error('Unexpected response structure:', data)
        throw new Error('Invalid response structure from API')
      }

        return data.content[0].text
      } catch (error) {
        lastError = error
        console.error(`Claude API Error (attempt ${attempt + 1}/${retries}):`, error)

        // Don't retry on certain errors
        if (error.message && (
          error.message.includes('API key') ||
          error.message.includes('authentication') ||
          error.message.includes('Invalid response structure')
        )) {
          throw error
        }

        // If this was the last retry, throw the error
        if (attempt === retries - 1) {
          throw new Error(`Failed after ${retries} attempts: ${error.message}`)
        }
      }
    }

    // Should never reach here, but just in case
    throw lastError || new Error('Unknown error occurred')
  }

  return {
    validateApiKey,
    callClaude
  }
}
