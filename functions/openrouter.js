const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
const crypto = require('crypto')

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

if (!OPENROUTER_API_KEY) {
  console.warn('OPENROUTER_API_KEY is not set. OpenRouter calls will fail.')
}

async function chatCompletion(payload, options = {}) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is required')
  }

  const maxRetries = options.retries ?? 3
  let lastError

  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    try {
      const requestPayload = {
        ...payload,
        model: payload.model || 'anthropic/claude-3-haiku',
      }

      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.URL || 'https://ep-christmas.netlify.app',
          'X-Title': 'EP Christmas 2025',
        },
        body: JSON.stringify(requestPayload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OpenRouter error (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      lastError = error
      const delay = Math.min(1000, 300 * Math.pow(2, attempt))
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

module.exports = {
  chatCompletion,
}

