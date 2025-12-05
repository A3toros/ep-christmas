const { ok, badRequest, serverError } = require('./response')
const { chatCompletion } = require('./openrouter')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok()
  if (event.httpMethod !== 'POST') return badRequest('Use POST')

  try {
    const body = JSON.parse(event.body || '{}')
    const { photoDataUrl, transcript, mode = 'single', style = 'rider' } = body

    if (!photoDataUrl || typeof photoDataUrl !== 'string') {
      return badRequest('photoDataUrl is required')
    }
    if (!transcript || typeof transcript !== 'string') {
      return badRequest('transcript is required')
    }
    if (mode !== 'single' && mode !== 'group') {
      return badRequest('mode must be "single" or "group"')
    }
    if (style !== 'rider' && style !== 'the-ride' && style !== 'the-mess') {
      return badRequest('style must be "rider", "the-ride", or "the-mess"')
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
- NEVER PRESERVE THE ORIGINAL BACKGROUND: Completely replace the background with a NEW Christmas-themed background
- GENERATE BACKGROUND BASED ON USER INPUT: Create a background that reflects their thoughts about giving presents on Christmas: "${transcript}"
- The background should be Christmas-themed and relate to what giving presents means to them (e.g., if they mention family, show a cozy family Christmas scene; if they mention joy, show a joyful Christmas celebration; if they mention love, show a warm Christmas atmosphere)
- The background should be magical and festive, showing a Christmas scene`

    let imagePrompt
    const personDescription = mode === 'single' ? 'this person' : 'these people'
    const personPronoun = mode === 'single' ? 'person' : 'people'
    const personVerb = mode === 'single' ? 'is' : 'are'

    if (style === 'rider') {
      // Rider style - person(s) in sleigh with Santa
      imagePrompt = `Transform ${personDescription} into riding in Santa's sleigh based on their thoughts about giving presents on Christmas: "${transcript}".

${facialPreservation}

Rider style requirements for ${mode === 'single' ? 'SINGLE person' : 'GROUP'}:
- The ${personPronoun} ${personVerb} sitting in Santa's sleigh (classic red sleigh with decorative elements)
- Santa Claus is also in the sleigh, driving or sitting with the ${personPronoun}
- The ${personPronoun} should be positioned in the sleigh, looking happy and festive
- The sleigh should be pulled by reindeer (at least 2-4 reindeer visible)
- ${mode === 'single' ? 'The person\'s face' : 'All people\'s faces'} should be clearly visible and recognizable
- Santa should be clearly visible and recognizable as Santa Claus
- The ${personPronoun} can be wearing festive Christmas clothing (red, green, or winter clothes)
- The scene should show the ${personPronoun} and Santa enjoying a magical Christmas sleigh ride together
${mode === 'group' ? '- Show all people together in the sleigh, interacting and having fun' : ''}

The portrait should show the ${personPronoun} riding in Santa's sleigh with Santa, reflecting their understanding of why giving presents is important. The background must be completely new, showing a magical Christmas scene (e.g., flying over snowy landscapes, starry night sky, Christmas lights, snowy rooftops, or magical Christmas atmosphere) that relates to their thoughts about giving presents. Return the image URL only.`
    } else if (style === 'the-ride') {
      // The Ride style - users become deer, AI-generated Santa drives
      imagePrompt = `Transform ${personDescription} into reindeer pulling Santa's sleigh based on their thoughts about giving presents on Christmas: "${transcript}".

${facialPreservation}

The Ride style requirements for ${mode === 'single' ? 'SINGLE person' : 'GROUP'}:
- The ${personPronoun} from the photo should be transformed into reindeer/deer pulling the sleigh
- PRESERVE FACIAL FEATURES: The reindeer should have the ${personPronoun} facial features preserved - their eyes, nose shape, mouth, and overall facial structure should be recognizable as the ${personPronoun} from the photo
- The reindeer should have the ${personPronoun} skin tone and hair color incorporated into the reindeer's appearance
- Santa Claus (AI-generated, not from photo) should be driving/sitting in the sleigh
- The sleigh should be a classic red Santa sleigh with decorative elements
- There should be at least 2-4 reindeer total (the ${personPronoun} transformed into reindeer plus additional reindeer if needed)
- The ${personPronoun}-turned-reindeer should be prominently featured in the front of the reindeer team
${mode === 'group' ? '- Show all people transformed into reindeer together, pulling the sleigh as a team' : '- Show the single person transformed into a reindeer leading the team'}
- The scene should show the magical Christmas sleigh ride with Santa driving

The portrait should show the ${personPronoun} as reindeer pulling Santa's sleigh, reflecting their understanding of why giving presents is important. The background must be completely new, showing a magical Christmas scene (e.g., flying over snowy landscapes, starry night sky, Christmas lights, snowy rooftops, or magical Christmas atmosphere) that relates to their thoughts about giving presents. Return the image URL only.`
    } else {
      // The Mess style - sleigh accident with fairy tale entities
      imagePrompt = `Create a FUNNY and COMICAL scene of a REAL Santa sleigh accident with magical fairy tale entities based on their thoughts about giving presents on Christmas: "${transcript}".

${facialPreservation}

The Mess style requirements for ${mode === 'single' ? 'SINGLE person' : 'GROUP'}:
- This MUST look like an ACTUAL ACCIDENT but in a FUNNY, COMICAL way - not scary or dangerous, but humorous and lighthearted
- The ${personPronoun} from the photo should be in a Santa sleigh that has ACTUALLY CRASHED - show real accident damage (sleigh tipped over, broken parts, wheels off, etc.) but make it FUNNY
- The ${personPronoun} should be clearly visible and recognizable, looking surprised, confused, amused, or laughing - showing they're okay and finding it funny
- Include magical entities from fairy tales (e.g., fairies, elves, gnomes, talking animals, magical creatures, wizards, witches, etc.) that are involved in or reacting to the accident in a FUNNY way (helping, laughing, confused, etc.)
- The sleigh should show REAL ACCIDENT DAMAGE but in a COMICAL way: tipped over, broken, stuck in snow, tangled with something, crashed into a tree or snowbank, etc. - make it look like a real crash but keep it FUNNY
- Reindeer should be visible, scattered or in disarray from the accident - some might be tangled in reins, others running away, some looking confused
- Santa Claus may or may not be present (can be shown helping, confused, laughing, or absent)
- The scene should look like a REAL ACCIDENT SCENE but be HUMOROUS and FESTIVE - show actual crash damage but keep the mood light and funny
- Include elements that relate to their thoughts about giving presents (e.g., presents scattered everywhere from the crash, magical gift-giving elements, etc.)
${mode === 'group' ? '- Show all people together in the accident scene, interacting with each other and the fairy tale entities - they should look like they\'re having fun despite the accident' : '- Show the single person clearly in the accident scene, looking amused or surprised'}
- The background should show a magical Christmas setting where the accident occurred - make it clear this is an actual crash site but keep it whimsical

The portrait should show a REAL but FUNNY sleigh accident scene with fairy tale entities - it must look like an actual crash happened (with real damage) but be presented in a comical, lighthearted way that makes people laugh. Reflect their understanding of why giving presents is important. The background must be completely new, showing a magical Christmas scene (e.g., enchanted forest, magical winter wonderland, fairy tale kingdom, or whimsical Christmas setting) that relates to their thoughts about giving presents. Return the image URL only.`
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
          console.log('[sleigh-portrait] Found image URL in text response')
        } else {
          console.error('[sleigh-portrait] Response is text, not image:', textResponse.substring(0, 500))
          throw new Error('The model returned text instead of an image. This model may not support image generation.')
        }
      }
      
      if (!styledImageUrl) {
        // Log response structure for debugging
        console.error('[sleigh-portrait] No image URL found in response.')
        console.error('[sleigh-portrait] Response structure:', {
          hasChoices: !!imageResponse.choices,
          choicesLength: imageResponse.choices?.length,
          firstChoiceKeys: imageResponse.choices?.[0] ? Object.keys(imageResponse.choices[0]) : [],
          messageKeys: imageResponse.choices?.[0]?.message ? Object.keys(imageResponse.choices[0].message) : [],
          topLevelKeys: Object.keys(imageResponse),
        })
        console.error('[sleigh-portrait] Full response (truncated):', JSON.stringify(imageResponse, null, 2).substring(0, 2000))
        throw new Error('Failed to extract image URL from response. The model may not support image generation or returned an unexpected format.')
      }
    }

    console.log('[sleigh-portrait] Image URL extracted successfully', {
      urlLength: styledImageUrl.length,
      isDataUrl: styledImageUrl.startsWith('data:'),
      isHttpUrl: styledImageUrl.startsWith('http'),
      mode,
    })

    return ok({
      styledImageUrl,
    })
  } catch (error) {
    console.error('sleigh-portrait error', error)
    return serverError('Failed to generate sleigh portrait', error.message)
  }
}

