const axios = require('axios')

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY
const ASSEMBLYAI_BASE_URL = process.env.ASSEMBLYAI_BASE_URL || 'https://api.assemblyai.com'

if (!ASSEMBLYAI_API_KEY) {
  console.warn('ASSEMBLYAI_API_KEY is not set. AssemblyAI calls will fail.')
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function transcribeAudio(base64Audio, mimeType = 'audio/webm', { retries = 3 } = {}) {
  if (!ASSEMBLYAI_API_KEY) {
    throw new Error('ASSEMBLYAI_API_KEY environment variable is required')
  }

  console.log('[assemblyai] Starting transcription', {
    audioLength: base64Audio.length,
    mimeType,
    retries,
  })

  try {
    const audioBuffer = Buffer.from(base64Audio, 'base64')
    console.log('[assemblyai] Uploading audio to AssemblyAI...', {
      bufferSize: audioBuffer.length,
    })

    const uploadResponse = await axios({
      method: 'post',
      url: `${ASSEMBLYAI_BASE_URL}/v2/upload`,
      headers: {
        Authorization: ASSEMBLYAI_API_KEY,
        'Content-Type': 'application/octet-stream',
        'Content-Length': audioBuffer.length,
      },
      data: audioBuffer,
      maxBodyLength: Infinity,
    })

    const { upload_url: uploadUrl } = uploadResponse.data
    console.log('[assemblyai] Audio uploaded, creating transcript...', {
      uploadUrl: uploadUrl?.substring(0, 50) + '...',
    })

    const transcriptResponse = await axios.post(
      `${ASSEMBLYAI_BASE_URL}/v2/transcript`,
      {
        audio_url: uploadUrl,
        language_detection: true,
        speaker_labels: false,
        auto_highlights: false,
        punctuate: true,
        format_text: true,
      },
      {
        headers: {
          Authorization: ASSEMBLYAI_API_KEY,
          'Content-Type': 'application/json',
        },
      },
    )

    const transcriptId = transcriptResponse.data.id
    console.log('[assemblyai] Transcript created', {
      transcriptId,
    })

    for (let attempt = 0; attempt < 40; attempt += 1) {
      const statusResponse = await axios.get(`${ASSEMBLYAI_BASE_URL}/v2/transcript/${transcriptId}`, {
        headers: {
          Authorization: ASSEMBLYAI_API_KEY,
        },
      })

      const status = statusResponse.data.status
      console.log('[assemblyai] Polling status', {
        attempt: attempt + 1,
        status,
        transcriptId,
      })

      if (status === 'completed') {
        const result = {
          text: statusResponse.data.text,
          words: statusResponse.data.words,
          confidence: statusResponse.data.confidence,
        }
        console.log('[assemblyai] Transcription completed', {
          textLength: result.text?.length || 0,
          confidence: result.confidence,
        })
        return result
      }

      if (status === 'error') {
        const errorMsg = statusResponse.data.error || 'AssemblyAI transcription failed'
        console.error('[assemblyai] Transcription error', {
          error: errorMsg,
          transcriptId,
        })
        throw new Error(errorMsg)
      }

      await sleep(1500)
    }

    console.warn('[assemblyai] Transcription timeout after 40 attempts', {
      transcriptId,
    })

    if (retries > 0) {
      console.log('[assemblyai] Retrying transcription', {
        remainingRetries: retries - 1,
      })
      await sleep(1000)
      return transcribeAudio(base64Audio, mimeType, { retries: retries - 1 })
    }

    throw new Error('AssemblyAI transcription timeout')
  } catch (error) {
    console.error('[assemblyai] Transcription error', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      response: error.response?.data,
    })
    throw error
  }
}

module.exports = {
  transcribeAudio,
}

