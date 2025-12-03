const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
const { ok, badRequest, serverError } = require('./response')

const ELEVENLABS_API_KEY = process.env.ELEVENLABS

// ElevenLabs TTS API for Santa's voice
// Using a deep male voice suitable for Santa Claus
const SANTA_VOICE_ID = 'uDsPstFWFBUXjIBimV7s' // Santa voice ID

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok()
  if (event.httpMethod !== 'POST') return badRequest('Use POST')

  try {
    const { text } = JSON.parse(event.body || '{}')

    if (!text || !text.trim()) {
      return badRequest('Text is required')
    }

    if (!ELEVENLABS_API_KEY) {
      return serverError('ELEVENLABS environment variable is required for TTS')
    }

    // Generate speech using ElevenLabs TTS API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${SANTA_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_flash_v2', // Much cheaper than v2 multilingual
        voice_settings: {
          stability: 0.65,
          similarity_boost: 0.5,
          style: 0.4,
          use_speaker_boost: false, // Also reduces cost
        },
        output_format: 'mp3_22050_32', // 10x cheaper than high quality version
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs TTS API error:', response.status, errorText)
      throw new Error(`TTS API error: ${errorText}`)
    }

    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')

    return ok({
      audioUrl: `data:audio/mp3;base64,${base64Audio}`,
      success: true,
      voice: SANTA_VOICE_ID,
      model: 'eleven_flash_v2',
    })
  } catch (error) {
    console.error('TTS function error:', error)
    return serverError('TTS failed', error.message)
  }
}

