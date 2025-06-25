// Utility to get the user's selected AI provider and API key from localStorage
export function getUserApiConfig() {
  return {
    provider: localStorage.getItem('userProvider') || 'openai',
    apiKey: localStorage.getItem('userApiKey') || ''
  };
}
