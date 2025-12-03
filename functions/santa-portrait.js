const { ok, badRequest, serverError } = require('./response')
const { chatCompletion } = require('./openrouter')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok()
  if (event.httpMethod !== 'POST') return badRequest('Use POST')

  try {
    const body = JSON.parse(event.body || '{}')
    const { photoDataUrl, transcript, style = 'jolly' } = body

    if (!photoDataUrl || typeof photoDataUrl !== 'string') {
      return badRequest('photoDataUrl is required')
    }
    if (!transcript || typeof transcript !== 'string') {
      return badRequest('transcript is required')
    }

    const [, base64] = photoDataUrl.split(',')
    if (!base64) return badRequest('Invalid photoDataUrl')
    const photoBuffer = Buffer.from(base64, 'base64')
    if (photoBuffer.length > 5 * 1024 * 1024) {
      return badRequest('Photo must be under 5MB')
    }

    // Detect gender from photo using AI vision
    let detectedGender = 'male' // Default fallback
    try {
      const genderDetectionResponse = await chatCompletion({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: photoDataUrl,
                },
              },
              {
                type: 'text',
                text: 'Look at this photo and determine if the person appears to be male or female. Respond with only one word: "male" or "female".',
              },
            ],
          },
        ],
        temperature: 0.1,
      })

      const genderText = genderDetectionResponse?.choices?.[0]?.message?.content?.toLowerCase() || ''
      if (genderText.includes('female') || genderText.includes('woman') || genderText.includes('girl')) {
        detectedGender = 'female'
      } else {
        detectedGender = 'male'
      }
      console.log('[santa-portrait] Detected gender:', detectedGender)
    } catch (genderError) {
      console.error('[santa-portrait] Gender detection failed, using default (male):', genderError)
      // Continue with default 'male'
    }

    // Create gender and style-specific image generation prompt
    let imagePrompt
    
    // Base facial preservation requirements (same for all styles)
    const facialPreservation = `CRITICAL FACIAL PRESERVATION REQUIREMENTS (MUST BE FOLLOWED):
- PRESERVE THE EXACT FACE: Keep the person's face shape, eye shape, eye color, nose shape, mouth shape, lip shape, cheekbones, jawline, and all facial proportions EXACTLY as they appear in the original photo
- PRESERVE FACIAL IDENTITY: The person must be immediately recognizable as the same person from the photo - their unique facial features and characteristics must remain unchanged
- PRESERVE SKIN TONE: Keep the exact skin tone and complexion from the original photo
- PRESERVE HAIR: Keep the person's hair color, texture, and style exactly as shown in the photo
- ONLY ADD COSTUME ELEMENTS: Add Santa costume elements WITHOUT changing any facial features
- NEW BACKGROUND: Replace the background completely with a style-appropriate setting - DO NOT keep the original background
- Photorealistic style, not cartoon`

    if (style === 'pirate') {
      // Pirate Santa style
      if (detectedGender === 'male') {
        imagePrompt = `Transform this person into a Pirate Santa Claus (Santa with pirate elements) based on their thoughts about Christmas: "${transcript}".

${facialPreservation}

Style requirements for MALE Pirate Santa (ADD these elements while preserving face):
- Santa Claus base appearance with pirate elements
- Big white beard (Santa's signature)
- Round belly (Santa's signature)
- Red Santa suit with white fur trim, but with pirate accessories
- Pirate hat (tricorn or similar) with Santa elements (maybe red with white trim, or Santa hat with pirate styling)
- Pirate accessories: eye patch (optional), sword, or pirate belt
- Jolly but adventurous expression (Santa's warmth with pirate's boldness)
- NEW BACKGROUND: Replace background completely with a pirate ship deck or pirate setting with Christmas decorations - DO NOT keep original background
- Mix of Christmas and pirate atmosphere
- Still clearly recognizable as Santa, but with pirate flair

The portrait should combine Santa's jolly Christmas spirit with pirate adventure. Return the image URL only.`
      } else {
        imagePrompt = `Transform this person into a Female Pirate Santa Claus (Mrs. Claus with pirate elements) based on their thoughts about Christmas: "${transcript}".

${facialPreservation}

Style requirements for FEMALE Pirate Santa (ADD these elements while preserving face):
- Female Santa appearance (Mrs. Claus style) with pirate elements
- Red dress or skirt (NOT pants) with pirate styling
- NO beard (clean-shaven face)
- Pirate hat (tricorn or similar) with Santa elements, or Santa hat with pirate styling
- Pirate accessories: eye patch (optional), sword, or pirate belt
- Warm but adventurous expression
- Festive accessories combined with pirate elements
- NEW BACKGROUND: Replace background completely with a pirate ship deck or pirate setting with Christmas decorations - DO NOT keep original background
- Mix of Christmas and pirate atmosphere

The portrait should combine Mrs. Claus's warmth with pirate adventure. Return the image URL only.`
      }
    } else if (style === 'evil') {
      // Evil Santa style
      if (detectedGender === 'male') {
        imagePrompt = `Transform this person into an Evil Santa Claus (dark, sinister Santa) based on their thoughts about Christmas: "${transcript}".

${facialPreservation}

Style requirements for MALE Evil Santa (ADD these elements while preserving face):
- Dark, sinister Santa Claus appearance
- Big white beard (but maybe slightly darker or shadowed)
- Round belly (Santa's signature)
- Dark red or black Santa suit with dark fur trim (darker than traditional red)
- Dark Santa hat (maybe black or dark red)
- Sinister, mischievous expression (dark but still recognizable as Santa)
- NEW BACKGROUND: Replace background completely with a dark, shadowy setting with twisted Christmas elements - DO NOT keep original background
- Darker, moodier atmosphere
- May have darker accessories or twisted Christmas decorations
- Still recognizable as Santa but with an evil/mischievous twist

The portrait should reflect an evil Santa character while maintaining the person's exact facial identity. Return the image URL only.`
      } else {
        imagePrompt = `Transform this person into an Evil Female Santa Claus (dark Mrs. Claus) based on their thoughts about Christmas: "${transcript}".

${facialPreservation}

Style requirements for FEMALE Evil Santa (ADD these elements while preserving face):
- Dark, sinister Female Santa appearance (Mrs. Claus style)
- Dark red or black dress or skirt (NOT pants)
- NO beard (clean-shaven face)
- Dark Santa hat (maybe black or dark red)
- Sinister, mischievous expression
- Darker accessories or twisted Christmas elements
- NEW BACKGROUND: Replace background completely with a dark, shadowy setting with twisted Christmas elements - DO NOT keep original background
- Darker, moodier atmosphere
- Still recognizable as Mrs. Claus but with an evil/mischievous twist

The portrait should reflect an evil Mrs. Claus character while maintaining the person's exact facial identity. Return the image URL only.`
      }
    } else {
      // Default: Jolly Santa style
      if (detectedGender === 'male') {
        imagePrompt = `Transform this person into Santa Claus based on their thoughts about Christmas: "${transcript}".

${facialPreservation}

Style requirements for MALE Jolly Santa (ADD these elements while preserving face):
- Traditional Santa Claus appearance
- Big white beard
- Round belly
- Red Santa suit with white fur trim
- Red hat with white pom-pom
- Jolly, cheerful expression
- NEW BACKGROUND: Replace background completely with a warm, festive Christmas setting (e.g., cozy room with fireplace, Christmas tree, snowy window, or magical Christmas atmosphere) - DO NOT keep original background
- Warm, festive atmosphere
- Bright, joyful Christmas setting

The portrait should reflect their understanding of Christmas while maintaining the person's exact facial identity. Return the image URL only.`
      } else {
        imagePrompt = `Transform this person into a Female Santa Claus (Mrs. Claus) based on their thoughts about Christmas: "${transcript}".

${facialPreservation}

Style requirements for FEMALE Jolly Santa (ADD these elements while preserving face):
- Female Santa appearance (Mrs. Claus style)
- Red dress or skirt (NOT pants)
- NO beard (clean-shaven face)
- Red hat with white fur trim
- Warm, cheerful expression
- Festive accessories (maybe a shawl or apron)
- NEW BACKGROUND: Replace background completely with a warm, festive Christmas setting (e.g., cozy room with fireplace, Christmas tree, snowy window, or magical Christmas atmosphere) - DO NOT keep original background
- Warm, festive atmosphere
- Bright, joyful Christmas setting

The portrait should reflect their understanding of Christmas while maintaining the person's exact facial identity. Return the image URL only.`
      }
    }

    // Generate image
    const models = ['google/gemini-2.5-flash-image-preview', 'stability/illustration-diffusion']
    let imageResponse
    let lastError

    for (const model of models) {
      try {
        imageResponse = await chatCompletion({
          model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: photoDataUrl,
                  },
                },
                {
                  type: 'text',
                  text: imagePrompt,
                },
              ],
            },
          ],
          temperature: 0.7,
        })

        const textResponse = imageResponse.choices?.[0]?.message?.content
        if (typeof textResponse === 'string' && textResponse.length > 0) {
          const lowerText = textResponse.toLowerCase()
          if (lowerText.includes("can't") || lowerText.includes("cannot") || lowerText.includes("prevent") || 
              lowerText.includes("refuse") || lowerText.includes("safety") || lowerText.includes("child")) {
            if (model === models[0] && models.length > 1) {
              lastError = new Error('Model refused to generate image')
              continue
            }
            throw new Error('The AI model cannot generate images based on photos of children for safety reasons.')
          }
        }

        if (imageResponse.choices && imageResponse.choices.length > 0) {
          const hasImage = imageResponse.choices[0]?.message?.images || 
                          imageResponse.choices[0]?.message?.image_url ||
                          imageResponse.choices[0]?.message?.image
          if (hasImage || !textResponse) {
            break
          }
        }
      } catch (apiError) {
        lastError = apiError
        continue
      }
    }

    if (!imageResponse) {
      throw new Error(`Image generation failed. Last error: ${lastError?.message || 'Unknown error'}`)
    }

    // Find image URL in response
    const findImageUrl = (obj) => {
      if (obj === null || obj === undefined) return null
      if (typeof obj === 'string') {
        if (obj.startsWith('http://') || obj.startsWith('https://') || obj.startsWith('data:image')) {
          return obj
        }
        return null
      }
      if (typeof obj !== 'object') return null
      if (obj.url && typeof obj.url === 'string' && (obj.url.startsWith('http') || obj.url.startsWith('data:image'))) {
        return obj.url
      }
      if (obj.image_url) {
        const url = typeof obj.image_url === 'string' ? obj.image_url : obj.image_url.url
        if (url && typeof url === 'string' && (url.startsWith('http') || url.startsWith('data:image'))) {
          return url
        }
      }
      if (obj.b64_json && typeof obj.b64_json === 'string') {
        return `data:image/png;base64,${obj.b64_json}`
      }
      if (Array.isArray(obj)) {
        for (const item of obj) {
          const found = findImageUrl(item)
          if (found) return found
        }
      } else {
        for (const value of Object.values(obj)) {
          const found = findImageUrl(value)
          if (found) return found
        }
      }
      return null
    }

    let styledImageUrl = findImageUrl(imageResponse)

    if (!styledImageUrl) {
      const choice = imageResponse.choices?.[0]
      if (choice?.message) {
        // Check for images array
        if (choice.message.images && Array.isArray(choice.message.images)) {
          for (const part of choice.message.images) {
            if (part?.image_url?.url) {
              styledImageUrl = part.image_url.url
              break
            }
            if (typeof part?.image_url === 'string') {
              styledImageUrl = part.image_url
              break
            }
          }
        }
        
        // Check for direct url property
        if (!styledImageUrl && choice.message.url) {
          styledImageUrl = choice.message.url
        }
        
        // Check for image property
        if (!styledImageUrl && choice.message.image) {
          styledImageUrl = typeof choice.message.image === 'string' ? choice.message.image : choice.message.image.url
        }
      }
    }

    if (!styledImageUrl) {
      // Final check - maybe the response is just text describing the image
      const textResponse = imageResponse.choices?.[0]?.message?.content
      if (typeof textResponse === 'string' && textResponse.length > 0) {
        console.error('[santa-portrait] Response is text, not image:', textResponse.substring(0, 500))
        throw new Error('The model returned text instead of an image. This model may not support image generation.')
      }
      
      console.error('[santa-portrait] No image URL found in response. Full response:', JSON.stringify(imageResponse, null, 2))
      throw new Error('Failed to extract image URL from response. The model may not support image generation or returned an unexpected format.')
    }

    console.log('[santa-portrait] Image URL extracted successfully', {
      urlLength: styledImageUrl.length,
      isDataUrl: styledImageUrl.startsWith('data:'),
      isHttpUrl: styledImageUrl.startsWith('http'),
    })

    return ok({
      styledImageUrl,
    })
  } catch (error) {
    console.error('santa-portrait error', error)
    return serverError('Failed to generate Santa portrait', error.message)
  }
}

