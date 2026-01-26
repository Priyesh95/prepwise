import { createContext, useContext, useState, useEffect } from 'react'
import { encodeKey, decodeKey } from '../../utils/encryption'

const ApiKeyContext = createContext()

export function useApiKey() {
  const context = useContext(ApiKeyContext)
  if (!context) {
    throw new Error('useApiKey must be used within ApiKeyProvider')
  }
  return context
}

export function ApiKeyProvider({ children }) {
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('prepwise_api_key')
    if (storedKey) {
      try {
        const decoded = decodeKey(storedKey)
        setApiKey(decoded)
      } catch (error) {
        console.error('Error loading API key:', error)
        localStorage.removeItem('prepwise_api_key')
      }
    }
    setIsLoading(false)
  }, [])

  // Save API key to localStorage
  const saveApiKey = (key) => {
    const encoded = encodeKey(key)
    localStorage.setItem('prepwise_api_key', encoded)
    setApiKey(key)
  }

  // Clear API key
  const clearApiKey = () => {
    localStorage.removeItem('prepwise_api_key')
    setApiKey('')
  }

  // Get current API key
  const getApiKey = () => {
    return apiKey
  }

  // Check if API key exists
  const hasApiKey = () => {
    return apiKey.length > 0
  }

  const value = {
    apiKey,
    saveApiKey,
    clearApiKey,
    getApiKey,
    hasApiKey,
    isLoading
  }

  return (
    <ApiKeyContext.Provider value={value}>
      {children}
    </ApiKeyContext.Provider>
  )
}

export default ApiKeyContext
