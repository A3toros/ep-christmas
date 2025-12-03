const { ok, badRequest, serverError } = require('./response')
const { chatCompletion } = require('./openrouter')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok()
  if (event.httpMethod !== 'POST') return badRequest('Use POST')

  try {
    const body = JSON.parse(event.body || '{}')
    const { photoDataUrl, transcript, style = 'santas-helper' } = body

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

    // Create style-specific image generation prompt
    let imagePrompt = ''
    
    if (style === 'santas-helper') {
      imagePrompt = `Transform this person into a colorful, Christmas-themed elf (Santa's helper) based on their Christmas wish: "${transcript}". 

CRITICAL FACIAL PRESERVATION REQUIREMENTS (MUST BE FOLLOWED):
- PRESERVE THE EXACT FACE: Keep the person's face shape, eye shape, eye color, nose shape, mouth shape, lip shape, cheekbones, jawline, and all facial proportions EXACTLY as they appear in the original photo
- PRESERVE FACIAL IDENTITY: The person must be immediately recognizable as the same person from the photo - their unique facial features and characteristics must remain unchanged
- PRESERVE SKIN TONE: Keep the exact skin tone and complexion from the original photo
- PRESERVE HAIR: Keep the person's hair color, texture, and style exactly as shown in the photo
- ONLY ADD COSTUME ELEMENTS: Add elf costume, pointed ears, hat, and accessories WITHOUT changing any facial features

Style requirements (ADD these elements while preserving face):
- Colorful Christmas elf costume (red, green, gold colors) - ADD as clothing only
- Pointed elf ears - ADD as prosthetic-like extensions, do not change ear shape
- Festive hat with bells - ADD as headwear
- Cheerful, happy expression - USE the person's natural expression
- Christmas-themed accessories (candy canes, presents, etc.) - ADD as props
- Bright, vibrant colors in background and costume
- Magical, festive atmosphere
- Photorealistic style, not cartoon

The portrait should be colorful, joyful, and Christmas-themed while maintaining the person's exact facial identity. Return the image URL only.`
    } else if (style === 'evil-elf') {
      imagePrompt = `Transform this person into an evil/mischievous Christmas elf based on their Christmas wish: "${transcript}". 

CRITICAL FACIAL PRESERVATION REQUIREMENTS (MUST BE FOLLOWED):
- PRESERVE THE EXACT FACE: Keep the person's face shape, eye shape, eye color, nose shape, mouth shape, lip shape, cheekbones, jawline, and all facial proportions EXACTLY as they appear in the original photo
- PRESERVE FACIAL IDENTITY: The person must be immediately recognizable as the same person from the photo - their unique facial features and characteristics must remain unchanged
- PRESERVE SKIN TONE: Keep the exact skin tone and complexion from the original photo
- PRESERVE HAIR: Keep the person's hair color, texture, and style exactly as shown in the photo
- ONLY ADD COSTUME ELEMENTS: Add elf costume, pointed ears, hat, and accessories WITHOUT changing any facial features
- EXPRESSION: Use the person's natural expression - do not dramatically alter their facial expression

Style requirements (ADD these elements while preserving face):
- Darker Christmas elf costume (dark red, dark green, black accents) - ADD as clothing only
- Pointed elf ears - ADD as prosthetic-like extensions, do not change ear shape
- Darker, moodier atmosphere in background and lighting
- May have darker accessories or twisted Christmas elements - ADD as props
- Still recognizable as an elf but with an evil/mischievous twist through costume and atmosphere
- Photorealistic style, not cartoon

The portrait should reflect an evil/mischievous elf character while maintaining the person's exact facial identity. Return the image URL only.`
    } else if (style === 'dobby') {
      imagePrompt = `Transform this person into Dobby the house-elf (from Harry Potter) style, but with Christmas elements, based on their Christmas wish: "${transcript}". 

CRITICAL REQUIREMENTS:
- PRESERVE FACIAL IDENTITY: Keep the person recognizable - maintain their face shape, nose shape, mouth shape, and overall facial structure
- PRESERVE SKIN TONE: Keep the exact skin tone and complexion from the original photo
- PRESERVE HAIR: Keep the person's hair color, texture, and style exactly as shown in the photo
- APPLY DOBBY FEATURES: Give the person Dobby's distinctive characteristics:
  * Large, expressive eyes (slightly larger than normal, but keep the person's eye color and shape)
  * Large bat-like ears (extend the person's ears to be larger and more bat-like, positioned higher on the head)
  * Slightly smaller stature/proportions (make the person appear slightly smaller in frame)
  * Dobby's gentle, kind expression (adapt the person's expression to be warm and kind like Dobby)
- DOBBY CLOTHING: Dress the person in Dobby's signature pillowcase garment, but with Christmas colors/patterns (red, green, gold Christmas-themed pillowcase)
- NEW BACKGROUND: Replace the background completely with a Christmas-themed setting (e.g., cozy room with fireplace, Christmas decorations, snowy window, or magical Christmas atmosphere) - DO NOT keep the original background
- Christmas-themed elements: Add Christmas accessories or decorations in the scene
- Photorealistic style, not cartoon

The person should look like Dobby (with large eyes and bat ears) while still being recognizable as themselves. The background should be completely new and Christmas-themed. Return the image URL only.`
    } else {
      // Default to Santa's helper
      imagePrompt = `Transform this person into a colorful, Christmas-themed elf (Santa's helper) based on their Christmas wish: "${transcript}". 

CRITICAL FACIAL PRESERVATION REQUIREMENTS (MUST BE FOLLOWED):
- PRESERVE THE EXACT FACE: Keep the person's face shape, eye shape, eye color, nose shape, mouth shape, lip shape, cheekbones, jawline, and all facial proportions EXACTLY as they appear in the original photo
- PRESERVE FACIAL IDENTITY: The person must be immediately recognizable as the same person from the photo - their unique facial features and characteristics must remain unchanged
- PRESERVE SKIN TONE: Keep the exact skin tone and complexion from the original photo
- PRESERVE HAIR: Keep the person's hair color, texture, and style exactly as shown in the photo
- ONLY ADD COSTUME ELEMENTS: Add elf costume, pointed ears, hat, and accessories WITHOUT changing any facial features

Style requirements (ADD these elements while preserving face):
- Colorful Christmas elf costume (red, green, gold colors) - ADD as clothing only
- Pointed elf ears - ADD as prosthetic-like extensions, do not change ear shape
- Festive hat with bells - ADD as headwear
- Cheerful, happy expression - USE the person's natural expression
- Christmas-themed accessories (candy canes, presents, etc.) - ADD as props
- Bright, vibrant colors in background and costume
- Magical, festive atmosphere
- Photorealistic style, not cartoon

The portrait should be colorful, joyful, and Christmas-themed while maintaining the person's exact facial identity. Return the image URL only.`
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
          temperature: 0.5, // Lower temperature for better facial feature preservation
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
        console.error('[elf-portrait] Response is text, not image:', textResponse.substring(0, 500))
        throw new Error('The model returned text instead of an image. This model may not support image generation.')
      }
      
      console.error('[elf-portrait] No image URL found in response. Full response:', JSON.stringify(imageResponse, null, 2))
      throw new Error('Failed to extract image URL from response. The model may not support image generation or returned an unexpected format.')
    }

    console.log('[elf-portrait] Image URL extracted successfully', {
      urlLength: styledImageUrl.length,
      isDataUrl: styledImageUrl.startsWith('data:'),
      isHttpUrl: styledImageUrl.startsWith('http'),
    })

    return ok({
      styledImageUrl,
    })
  } catch (error) {
    console.error('elf-portrait error', error)
    return serverError('Failed to generate elf portrait', error.message)
  }
}

