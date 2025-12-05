const { ok, badRequest, serverError } = require('./response')
const { chatCompletion } = require('./openrouter')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok()
  if (event.httpMethod !== 'POST') return badRequest('Use POST')

  try {
    const body = JSON.parse(event.body || '{}')
    const { photoDataUrl, transcript, mode = 'single', style = 'grinch' } = body

    if (!photoDataUrl || typeof photoDataUrl !== 'string') {
      return badRequest('photoDataUrl is required')
    }
    if (!transcript || typeof transcript !== 'string') {
      return badRequest('transcript is required')
    }
    if (mode !== 'single' && mode !== 'group') {
      return badRequest('mode must be "single" or "group"')
    }
    if (style !== 'grinch' && style !== 'terminator' && style !== 'literally-me') {
      return badRequest('style must be "grinch", "terminator", or "literally-me"')
    }

    const [, base64] = photoDataUrl.split(',')
    if (!base64) return badRequest('Invalid photoDataUrl')
    const photoBuffer = Buffer.from(base64, 'base64')
    if (photoBuffer.length > 5 * 1024 * 1024) {
      return badRequest('Photo must be under 5MB')
    }

    // Base facial preservation requirements
    const facialPreservation = `CRITICAL FACIAL PRESERVATION REQUIREMENTS (MUST BE FOLLOWED):
- PRESERVE THE EXACT FACE(S): Keep all person(s) face shape, eye shape, eye color, nose shape, mouth shape, lip shape, cheekbones, jawline, and all facial proportions EXACTLY as they appear in the original photo
- PRESERVE FACIAL IDENTITY: All person(s) must be immediately recognizable as the same person(s) from the photo - their unique facial features and characteristics must remain unchanged
- PRESERVE SKIN TONE: Keep the exact skin tone and complexion from the original photo for all person(s)
- PRESERVE HAIR: Keep all person(s) hair color, texture, and style exactly as shown in the photo
- FACE MUST ORGANICALLY MATCH THE BODY: The face(s) should naturally fit and blend with the body proportions and pose - adjust face position/orientation if needed to match the body's pose and angle
- FACE POSITION CAN BE CHANGED: The face position, angle, and orientation can be adjusted to match the body's pose and make it look natural and organic
- Photorealistic style, not cartoon

CRITICAL BACKGROUND REQUIREMENT (MUST BE FOLLOWED):
- NEVER PRESERVE THE ORIGINAL BACKGROUND: Completely replace the background with a NEW scene based on user input
- GENERATE BACKGROUND BASED ON USER INPUT: Create a background that shows destruction/chaos related to their thoughts about why people should not celebrate Christmas: "${transcript}"
- The background should show destruction, chaos, or anti-Christmas elements based on their input (e.g., if they mention consumerism, show destroyed shopping malls; if they mention waste, show environmental destruction; if they mention stress, show chaotic scenes)`

    let imagePrompt
    const personDescription = mode === 'single' ? 'this person' : 'these people'
    const personPronoun = mode === 'single' ? 'person' : 'people'
    const personVerb = mode === 'single' ? 'is' : 'are'

    if (style === 'grinch') {
      // Grinch style - Grinch with user face destroys what was in input
      imagePrompt = `Transform ${personDescription} into the Grinch destroying Christmas based on their thoughts about why people should not celebrate Christmas: "${transcript}".

${facialPreservation}

Grinch style requirements for ${mode === 'single' ? 'SINGLE person' : 'GROUP'}:
- The ${personPronoun} should be transformed into the Grinch character but with their EXACT FACE preserved
- The ${personPronoun} should have Grinch's green fur body, but their face should be clearly recognizable as the ${personPronoun} from the photo
- The ${personPronoun} should be shown actively destroying or causing chaos related to their input: "${transcript}"
- Show destruction/chaos based on their thoughts (e.g., destroying Christmas trees, presents, decorations, or whatever relates to their input)
- The Grinch costume should be accurate (green fur, red eyes, mischievous expression) but with the ${personPronoun}'s preserved facial features
- The scene should show active destruction happening - the ${personPronoun} as Grinch should be in the act of destroying Christmas elements
${mode === 'group' ? '- Show all people transformed into Grinches together, destroying Christmas elements as a team' : '- Show the single person as Grinch clearly destroying Christmas elements'}
- The background should show the destruction/chaos related to their input

The portrait should show the ${personPronoun} as the Grinch destroying Christmas elements based on their input: "${transcript}". The background must be completely new, showing destruction and chaos related to their thoughts about why people should not celebrate Christmas. Return the image URL only.`
    } else if (style === 'terminator') {
      // Terminator style - Terminator T-800 from Terminator 2 with user face
      imagePrompt = `Transform ${personDescription} into the Terminator T-800 from Terminator 2 destroying Christmas based on their thoughts about why people should not celebrate Christmas: "${transcript}".

${facialPreservation}

Terminator style requirements for ${mode === 'single' ? 'SINGLE person' : 'GROUP'}:
- The ${personPronoun} should be transformed into the Terminator T-800 from Terminator 2, but with their EXACT FACE preserved (NOT Arnold Schwarzenegger's face)
- The ${personPronoun} should have the Terminator's muscular build (like Arnold Schwarzenegger's body), leather jacket, and shotgun
- CRITICAL: The ${personPronoun}'s FACE should be their OWN FACE from the photo - clearly visible, recognizable, and NOT covered by metal
- NO METAL ON FACE: The face must be fully visible and recognizable - do NOT cover the face with metallic elements or metal
- CRITICAL: EYES MUST BE USER'S EYES: The ${personPronoun}'s eyes must be their OWN EYES from the photo - preserve the exact eye color, shape, and appearance. Do NOT add red glowing eyes or change the eye color
- The ${personPronoun}'s face can have cyber elements (like cybernetic patterns or digital effects), but the eyes must remain the user's original eyes and the face itself must remain visible and recognizable
- The facial features, structure, and identity must be the ${personPronoun}'s own face - clearly visible and recognizable
- The ${personPronoun} should be shown actively destroying or causing chaos related to their input: "${transcript}"
- Show destruction/chaos based on their thoughts (e.g., destroying Christmas trees, presents, decorations, or whatever relates to their input)
- The Terminator should be holding a shotgun and wearing a leather jacket (classic Terminator 2 look)
- The scene should show active destruction happening - the ${personPronoun} as Terminator should be in the act of destroying Christmas elements
${mode === 'group' ? '- Show all people transformed into Terminators together, destroying Christmas elements as a team - each person should have their own visible, recognizable face, not Arnold\'s face' : '- Show the single person as Terminator clearly destroying Christmas elements - with their own visible, recognizable face, not Arnold\'s face'}
- The background should show the destruction/chaos related to their input

The portrait should show the ${personPronoun} as the Terminator T-800 destroying Christmas elements based on their input: "${transcript}". The ${personPronoun}'s FACE must be their OWN FACE from the photo (NOT Arnold Schwarzenegger's face), fully visible and recognizable with NO METAL covering it. The ${personPronoun}'s EYES must be their OWN EYES from the photo - preserve the exact eye color and appearance, do NOT add red glowing eyes. Cyber elements like cybernetic patterns or digital effects can be added, but the eyes must remain the user's original eyes and the face must remain visible. The body should have Terminator's build, clothing, and accessories. The background must be completely new, showing destruction and chaos related to their thoughts about why people should not celebrate Christmas. Return the image URL only.`
    } else {
      // Literally Me style - Cyberpunk 2077 Officer K outfit with user face
      imagePrompt = `Transform ${personDescription} into a cyberpunk character wearing Officer K's outfit from Blade Runner 2049 (cyberpunk style) destroying Christmas based on their thoughts about why people should not celebrate Christmas: "${transcript}".

${facialPreservation}

Literally Me style requirements for ${mode === 'single' ? 'SINGLE person' : 'GROUP'}:
- The ${personPronoun} should be wearing Officer K's outfit from Blade Runner 2049 (cyberpunk 2077 style)
- The ${personPronoun}'s face should be EXACTLY preserved from the photo - clearly recognizable
- The outfit should be cyberpunk style: long coat, futuristic clothing, cyberpunk aesthetic, similar to Officer K from Blade Runner 2049
- The ${personPronoun} should be shown actively destroying or causing chaos related to their input: "${transcript}"
- Show destruction/chaos based on their thoughts (e.g., destroying Christmas trees, presents, decorations, or whatever relates to their input)
- The scene should have a cyberpunk aesthetic with neon lights, futuristic elements, and dystopian atmosphere
- The scene should show active destruction happening - the ${personPronoun} should be in the act of destroying Christmas elements
${mode === 'group' ? '- Show all people together in cyberpunk Officer K style outfits, destroying Christmas elements as a team' : '- Show the single person clearly in cyberpunk Officer K style outfit destroying Christmas elements'}
- The background should show cyberpunk-style destruction and chaos related to their input

The portrait should show the ${personPronoun} in cyberpunk Officer K style outfit destroying Christmas elements based on their input: "${transcript}". The background must be completely new, showing cyberpunk-style destruction and chaos related to their thoughts about why people should not celebrate Christmas. Return the image URL only.`
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
            // Check for direct image data
            if (part?.url) {
              styledImageUrl = part.url
              break
            }
            if (part?.image) {
              styledImageUrl = typeof part.image === 'string' ? part.image : part.image.url
              break
            }
          }
        }
        
        // Check for content array (some models return images in content array)
        if (!styledImageUrl && choice.message.content && Array.isArray(choice.message.content)) {
          for (const contentItem of choice.message.content) {
            if (contentItem?.type === 'image_url' && contentItem?.image_url?.url) {
              styledImageUrl = contentItem.image_url.url
              break
            }
            if (contentItem?.type === 'image' && contentItem?.url) {
              styledImageUrl = contentItem.url
              break
            }
            if (contentItem?.image_url) {
              const url = typeof contentItem.image_url === 'string' ? contentItem.image_url : contentItem.image_url.url
              if (url) {
                styledImageUrl = url
                break
              }
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
        
        // Check for data property (some models return base64 in data)
        if (!styledImageUrl && choice.message.data) {
          if (typeof choice.message.data === 'string' && choice.message.data.startsWith('data:image')) {
            styledImageUrl = choice.message.data
          } else if (choice.message.data.url) {
            styledImageUrl = choice.message.data.url
          }
        }
      }
      
      // Check top-level response properties
      if (!styledImageUrl) {
        if (imageResponse.url) {
          styledImageUrl = imageResponse.url
        }
        if (!styledImageUrl && imageResponse.image) {
          styledImageUrl = typeof imageResponse.image === 'string' ? imageResponse.image : imageResponse.image.url
        }
        if (!styledImageUrl && imageResponse.data && imageResponse.data.url) {
          styledImageUrl = imageResponse.data.url
        }
      }
    }

    if (!styledImageUrl) {
      // Final check - maybe the response is just text describing the image
      const textResponse = imageResponse.choices?.[0]?.message?.content
      if (typeof textResponse === 'string' && textResponse.length > 0) {
        // Check if text contains a URL
        const urlMatch = textResponse.match(/https?:\/\/[^\s]+|data:image\/[^;]+;base64,[^\s]+/i)
        if (urlMatch) {
          styledImageUrl = urlMatch[0]
          console.log('[destroy-christmas-portrait] Found image URL in text response')
        } else {
          console.error('[destroy-christmas-portrait] Response is text, not image:', textResponse.substring(0, 500))
          throw new Error('The model returned text instead of an image. This model may not support image generation.')
        }
      }
      
      if (!styledImageUrl) {
        // Log response structure for debugging
        console.error('[destroy-christmas-portrait] No image URL found in response.')
        console.error('[destroy-christmas-portrait] Response structure:', {
          hasChoices: !!imageResponse.choices,
          choicesLength: imageResponse.choices?.length,
          firstChoiceKeys: imageResponse.choices?.[0] ? Object.keys(imageResponse.choices[0]) : [],
          messageKeys: imageResponse.choices?.[0]?.message ? Object.keys(imageResponse.choices[0].message) : [],
          topLevelKeys: Object.keys(imageResponse),
        })
        console.error('[destroy-christmas-portrait] Full response (truncated):', JSON.stringify(imageResponse, null, 2).substring(0, 2000))
        throw new Error('Failed to extract image URL from response. The model may not support image generation or returned an unexpected format.')
      }
    }

    console.log('[destroy-christmas-portrait] Image URL extracted successfully', {
      urlLength: styledImageUrl.length,
      isDataUrl: styledImageUrl.startsWith('data:'),
      isHttpUrl: styledImageUrl.startsWith('http'),
      mode,
      style,
    })

    return ok({
      styledImageUrl,
    })
  } catch (error) {
    console.error('destroy-christmas-portrait error', error)
    return serverError('Failed to generate destroy Christmas portrait', error.message)
  }
}

