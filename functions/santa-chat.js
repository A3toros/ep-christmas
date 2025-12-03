const { ok, badRequest, serverError } = require('./response')
const { transcribeAudio } = require('./assemblyai')
const { chatCompletion } = require('./openrouter')

exports.handler = async (event) => {
  const startTime = Date.now()
  console.log('[santa-chat] Function started', {
    method: event.httpMethod,
    hasBody: !!event.body,
    bodyLength: event.body?.length || 0,
    timestamp: new Date().toISOString(),
  })

  if (event.httpMethod === 'OPTIONS') {
    console.log('[santa-chat] OPTIONS request, returning ok')
    return ok()
  }
  
  if (event.httpMethod !== 'POST') {
    console.error('[santa-chat] Invalid method:', event.httpMethod)
    return badRequest('Use POST')
  }

  try {
    console.log('[santa-chat] Parsing request body...')
    const body = JSON.parse(event.body || '{}')
    const { audioBlob, mimeType = 'audio/webm', activity = 'speak-with-santa', textInput } = body

    console.log('[santa-chat] Request parsed', {
      hasAudioBlob: !!audioBlob,
      audioBlobLength: audioBlob?.length || 0,
      mimeType,
      activity,
      hasTextInput: !!textInput,
      textInputLength: textInput?.length || 0,
    })

    let transcript = ''
    
    if (textInput && typeof textInput === 'string' && textInput.trim()) {
      // Use text input directly
      console.log('[santa-chat] Using text input directly')
      transcript = textInput.trim()
      console.log('[santa-chat] Transcript from text:', transcript.substring(0, 100))
    } else if (audioBlob) {
      // Transcribe audio
      console.log('[santa-chat] Starting audio transcription...', {
        audioBlobLength: audioBlob.length,
        mimeType,
      })
      const transcriptionStartTime = Date.now()
      try {
        const transcriptResult = await transcribeAudio(audioBlob, mimeType)
        const transcriptionDuration = Date.now() - transcriptionStartTime
        transcript = transcriptResult.text || ''
        console.log('[santa-chat] Transcription completed', {
          duration: `${transcriptionDuration}ms`,
          transcriptLength: transcript.length,
          transcriptPreview: transcript.substring(0, 100),
        })
      } catch (transcriptionError) {
        console.error('[santa-chat] Transcription failed', {
          error: transcriptionError.message,
          stack: transcriptionError.stack,
          name: transcriptionError.name,
        })
        throw transcriptionError
      }
    } else {
      console.error('[santa-chat] Missing required input', {
        hasAudioBlob: !!audioBlob,
        hasTextInput: !!textInput,
      })
      return badRequest('Either audioBlob or textInput is required')
    }

    if (activity === 'become-santa') {
      // For Become Santa activity, just return transcript
      console.log('[santa-chat] Become Santa activity, returning transcript only')
      const totalDuration = Date.now() - startTime
      console.log('[santa-chat] Function completed successfully', {
        duration: `${totalDuration}ms`,
        activity,
      })
      return ok({
        transcript,
      })
    }

    // For Speak with Santa activity, generate Santa's response
    console.log('[santa-chat] Generating Santa response...', {
      transcriptLength: transcript.length,
    })
    const santaPrompt = `You are Santa Claus. A student just told you what they want for Christmas: "${transcript}"

Respond as Santa Claus with his signature voice and style:
- Adopt a warm, resonant baritone that naturally projects joy and paternal warmth
- Speak at a measured, unhurried pace, frequently emphasizing words with extra warmth
- Start with "Ho ho ho!" (his signature greeting)
- Use gentle interjections like "Well now," "Why," or "My goodness,"
- Use endearing terms like "dear child" or "young friend"
- Favor warm vocabulary choices like "wonderful," "merry," and "jolly"
- Incorporate tag questions that invite agreement, such as "...isn't that right?"
- Maintain a perfect balance of gentle authority and playful warmth
- Let sentences flow with a natural storytelling rhythm
- Project genuine interest, patience, and delight in simple pleasures
- Think of each sentence as being delivered with a slight twinkle in your eye and the suggestion of a smile in your voice
- End by saying you want them to become your friend elf

IMPORTANT:
- Keep it VERY short (maximum 2 sentences total, including the Ho ho ho!)
- Do NOT use any emojis or special characters
- Use only plain text
- Be warm, festive, and concise
- Sound like Santa Claus - warm, jolly, and full of Christmas spirit`

    const aiStartTime = Date.now()
    let completion
    try {
      console.log('[santa-chat] Calling chatCompletion API...', {
        model: 'anthropic/claude-3-haiku',
        promptLength: santaPrompt.length,
      })
      completion = await chatCompletion({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'user',
            content: santaPrompt,
          },
        ],
        temperature: 0.8,
      })
      const aiDuration = Date.now() - aiStartTime
      console.log('[santa-chat] AI completion received', {
        duration: `${aiDuration}ms`,
        hasChoices: !!completion?.choices,
        choicesLength: completion?.choices?.length || 0,
        hasContent: !!completion?.choices?.[0]?.message?.content,
      })
    } catch (aiError) {
      const aiDuration = Date.now() - aiStartTime
      console.error('[santa-chat] AI completion failed', {
        duration: `${aiDuration}ms`,
        error: aiError.message,
        stack: aiError.stack,
        name: aiError.name,
        code: aiError.code,
      })
      throw aiError
    }

    let santaResponse = completion?.choices?.[0]?.message?.content || 'Ho Ho Ho! That sounds wonderful! I want you to become my friend elf!'
    console.log('[santa-chat] Raw Santa response', {
      responseLength: santaResponse.length,
      responsePreview: santaResponse.substring(0, 100),
    })
    
    // Remove emojis and clean up the response
    santaResponse = santaResponse.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').replace(/[\u{2600}-\u{26FF}]/gu, '').replace(/[\u{2700}-\u{27BF}]/gu, '').trim()
    
    // Ensure it starts with Ho Ho Ho if it doesn't already
    if (!santaResponse.toLowerCase().startsWith('ho ho ho')) {
      santaResponse = 'Ho Ho Ho! ' + santaResponse
    }

    const totalDuration = Date.now() - startTime
    console.log('[santa-chat] Function completed successfully', {
      duration: `${totalDuration}ms`,
      transcriptLength: transcript.length,
      santaResponseLength: santaResponse.length,
      activity,
    })

    return ok({
      transcript,
      santaResponse,
    })
  } catch (error) {
    const totalDuration = Date.now() - startTime
    console.error('[santa-chat] Function error', {
      duration: `${totalDuration}ms`,
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
        code: error.code,
        cause: error.cause,
      },
      timestamp: new Date().toISOString(),
    })
    return serverError('Failed to process Santa chat', error.message)
  }
}

