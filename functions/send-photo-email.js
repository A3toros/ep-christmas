const nodemailer = require('nodemailer')
const { ok, badRequest, serverError } = require('./response')

const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD
const GMAIL_FROM_NAME = process.env.GMAIL_FROM_NAME || 'Christmas AI'

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return ok()
  if (event.httpMethod !== 'POST') return badRequest('Use POST')

  try {
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      return badRequest('GMAIL_USER and GMAIL_APP_PASSWORD are required')
    }

    const body = JSON.parse(event.body || '{}')
    const { email, styledImageUrl, characterType, sessionId = null } = body

    if (!email || !styledImageUrl) {
      return badRequest('email and styledImageUrl are required')
    }

    // Create Gmail transporter
    const cleanAppPassword = GMAIL_APP_PASSWORD.replace(/\s+/g, '')
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER.trim(),
        pass: cleanAppPassword,
      },
    })
    
    console.log('[send-photo-email] Gmail config:', {
      user: GMAIL_USER.trim(),
      passwordLength: cleanAppPassword.length,
      passwordPreview: cleanAppPassword.substring(0, 4) + '...',
    })

    // Determine character type
    const isElf = characterType === 'elf'
    const isSanta = characterType === 'santa'
    const isSleigh = characterType === 'sleigh'
    const isDestroyChristmas = characterType === 'destroy-christmas'
    
    // Christmas color scheme
    const primaryColor = isElf ? '#16A34A' : isSleigh ? '#8B4513' : isDestroyChristmas ? '#7C2D12' : '#DC2626' // Green for elf, brown for sleigh, dark red for destroy, red for Santa
    const secondaryColor = isElf ? '#F59E0B' : '#F59E0B' // Gold for all
    const accentColor = '#F59E0B' // Gold
    
    // Email subject and title
    const emailSubject = isElf 
      ? 'Your Christmas Elf Portrait!'
      : isSleigh
      ? 'Your Sleigh Ride Portrait!'
      : isDestroyChristmas
      ? 'Your Destroy Christmas Portrait!'
      : 'Your Santa Portrait!'
    
    const emailTitle = isElf
      ? 'Your Christmas Elf Portrait'
      : isSleigh
      ? 'Your Sleigh Ride Portrait'
      : isDestroyChristmas
      ? 'Your Destroy Christmas Portrait'
      : 'Your Santa Portrait'
    
    const characterLabel = isElf
      ? 'You are now Santa\'s Friend Elf!'
      : isSleigh
      ? 'You\'re riding with Santa!'
      : isDestroyChristmas
      ? 'You are now a Christmas Destroyer!'
      : 'You are now Santa!'

    // Convert base64 to buffer for email attachment
    let imageBuffer = null
    let imageCid = null
    if (styledImageUrl && styledImageUrl.startsWith('data:image')) {
      try {
        const base64Data = styledImageUrl.split(',')[1]
        imageBuffer = Buffer.from(base64Data, 'base64')
        imageCid = `portrait-${Date.now()}`
        console.log('[send-photo-email] Converted base64 to buffer, size:', imageBuffer.length)
      } catch (bufferError) {
        console.error('[send-photo-email] Failed to convert base64 to buffer:', bufferError)
      }
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailTitle}</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="width: 100%; min-height: 100vh; padding: 60px 20px; background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 50px;">
      <h1 style="margin: 0 0 10px 0; color: ${primaryColor}; font-size: 42px; font-weight: 700; letter-spacing: -0.5px;">
        ${emailTitle}
      </h1>
      <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 18px;">
        Merry Christmas!
      </p>
    </div>

    <!-- Character Label -->
    <div style="text-align: center; margin-bottom: 40px; padding: 30px 20px; background: rgba(255, 255, 255, 0.1); border-radius: 20px; border: 2px solid rgba(255, 255, 255, 0.3);">
      <p style="margin: 0; color: #FFFFFF; font-size: 36px; font-weight: 700;">
        ${characterLabel}
      </p>
    </div>

    <!-- Image Notice -->
    <div style="text-align: center; margin-bottom: 40px; padding: 30px 20px; background: rgba(245, 158, 11, 0.1); border-radius: 16px; border: 2px solid rgba(245, 158, 11, 0.3);">
      <p style="margin: 0 0 8px 0; color: ${accentColor}; font-size: 24px;">
        Your portrait is attached!
      </p>
      <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; line-height: 1.6;">
        ${isElf 
          ? 'Check the attachment below to see your AI-generated Christmas elf portrait!'
          : isSleigh
          ? 'Check the attachment below to see your AI-generated sleigh ride portrait!'
          : isDestroyChristmas
          ? 'Check the attachment below to see your AI-generated destroy Christmas portrait!'
          : 'Check the attachment below to see your AI-generated Santa portrait!'}
      </p>
    </div>

    <!-- Message -->
    <div style="max-width: 600px; margin: 0 auto 40px auto; padding: 30px 25px; background: rgba(255, 255, 255, 0.08); border-radius: 16px; border-left: 4px solid ${primaryColor};">
      <p style="margin: 0 0 16px 0; color: #FFFFFF; font-size: 18px; line-height: 1.7; font-weight: 500;">
        ${isElf 
          ? 'Ho Ho Ho! You\'re now one of Santa\'s friend elves!'
          : isSleigh
          ? 'Ho Ho Ho! You\'re riding with Santa in his magical sleigh!'
          : isDestroyChristmas
          ? 'You\'ve become a Christmas destroyer!'
          : 'Ho Ho Ho! You\'re now Santa!'}
      </p>
      <p style="margin: 0; color: rgba(255, 255, 255, 0.85); font-size: 16px; line-height: 1.7;">
        You can download your portrait, share it with your family, or print it out to remember this magical Christmas moment!
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 40px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
      <p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">
        Merry Christmas and Happy Holidays!
      </p>
      <p style="margin: 0; color: rgba(255, 255, 255, 0.6); font-size: 12px;">
        Mathayomwatsing EP Christmas 2025
      </p>
    </div>

  </div>
</body>
</html>
    `

    // Update HTML to use attachment CID for inline image
    let htmlWithImage = html
    if (imageCid) {
      const imageSection = `
    <!-- Image -->
    <div style="text-align: center; margin-bottom: 40px;">
      <img src="cid:${imageCid}" alt="Portrait" style="max-width: 100%; max-height: 600px; height: auto; border-radius: 12px; border: 2px solid ${accentColor}; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);" />
    </div>
`
      htmlWithImage = html.replace(
        /<!-- Image Notice -->[\s\S]*?<\/div>/,
        imageSection
      )
    }

    // Prepare email options for nodemailer
    const mailOptions = {
      from: `${GMAIL_FROM_NAME} <${GMAIL_USER}>`,
      to: email,
      subject: emailSubject,
      html: htmlWithImage,
    }

    // Add attachment if we have image buffer
    if (imageBuffer && imageCid) {
      mailOptions.attachments = [
        {
          filename: isElf ? 'elf-portrait.png' : isSleigh ? 'sleigh-portrait.png' : isDestroyChristmas ? 'destroy-christmas-portrait.png' : 'santa-portrait.png',
          content: imageBuffer,
          cid: imageCid,
        },
      ]
      console.log('[send-photo-email] Added image as attachment with CID:', imageCid)
    }

    // Send email using Gmail SMTP
    const info = await transporter.sendMail(mailOptions)
    console.log('[send-photo-email] Email sent successfully:', info.messageId)

    return ok({ delivered: true })
  } catch (error) {
    console.error('send-photo-email error', error)
    return serverError('Failed to send email', error.message)
  }
}

