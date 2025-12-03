# Setup Guide

## Prerequisites

- Node.js 18+ installed
- Netlify account (for deployment)
- Gmail account (for email sending)
- OpenRouter API key
- AssemblyAI API key

## Installation

1. **Install root dependencies:**
```bash
npm install
```

2. **Install function dependencies:**
```bash
cd functions
npm install
cd ..
```

## Environment Variables

Set these in your Netlify dashboard (Site settings → Environment variables):

### Required Variables

- `GMAIL_USER` - Your Gmail address (e.g., `yourname@gmail.com`)
- `GMAIL_APP_PASSWORD` - Gmail app password (generate from Google Account settings)
- `GMAIL_FROM_NAME` - Email sender name (default: "Christmas AI")
- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `ASSEMBLYAI_API_KEY` - Your AssemblyAI API key

### Getting Gmail App Password

1. Go to your Google Account settings
2. Security → 2-Step Verification (must be enabled)
3. App passwords → Generate app password
4. Copy the 16-character password
5. Use it as `GMAIL_APP_PASSWORD`

### Getting API Keys

**OpenRouter:**
1. Sign up at https://openrouter.ai
2. Go to Keys section
3. Create a new API key
4. Copy the key (starts with `sk-or-...`)

**AssemblyAI:**
1. Sign up at https://www.assemblyai.com
2. Go to Dashboard → API Key
3. Copy your API key

## Local Development

1. **Start development server:**
```bash
npm run dev
```

2. **Test Netlify functions locally:**
```bash
netlify dev
```

## Deployment

1. **Build the project:**
```bash
npm run build
```

2. **Deploy to Netlify:**
   - Connect your Git repository to Netlify
   - Set environment variables in Netlify dashboard
   - Netlify will auto-deploy on push

## Testing

1. **Test Speak with Santa:**
   - Navigate to `/activity/speak-with-santa`
   - Record your Christmas wish
   - Capture photo
   - Generate elf portrait
   - Send email

2. **Test Become Santa:**
   - Navigate to `/activity/become-santa`
   - Record your thoughts about Christmas
   - Select gender
   - Capture photo
   - Generate Santa portrait
   - Send email

## Troubleshooting

### Camera not working
- Check browser permissions
- Try different browser (Chrome recommended)
- Ensure HTTPS (required for camera access)

### Email not sending
- Verify Gmail credentials are correct
- Check Gmail app password is valid
- Ensure 2-Step Verification is enabled
- Check Netlify function logs

### Image generation failing
- Verify OpenRouter API key is correct
- Check API quota/limits
- Review function logs for errors

### Speech transcription failing
- Verify AssemblyAI API key is correct
- Check API quota/limits
- Ensure audio is being recorded properly

