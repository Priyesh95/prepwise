// Simple obfuscation for API key storage
// Note: This is NOT true encryption, just basic protection

export function encodeKey(key) {
  try {
    return btoa(key) // Base64 encode
  } catch (error) {
    console.error('Error encoding key:', error)
    return key
  }
}

export function decodeKey(encodedKey) {
  try {
    return atob(encodedKey) // Base64 decode
  } catch (error) {
    console.error('Error decoding key:', error)
    return encodedKey
  }
}

export function validateApiKeyFormat(key) {
  // Claude API keys start with "sk-ant-api03-"
  return key && key.startsWith('sk-ant-api03-')
}
