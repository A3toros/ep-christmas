# Christmas AI Project Plan

## Overview
A Christmas-themed AI project based on the open-house project structure. Features snowfall animation, bilingual prompts, AI Santa interactions, and camera-based transformations.

## Project Structure
```
ep-christmas/
├── package.json
├── vite.config.ts
├── netlify.toml
├── tailwind.config.js
├── tsconfig.json
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── routes/
│   │   ├── Home.tsx
│   │   ├── ActivityLayout.tsx
│   │   └── activities/
│   │       ├── activityList.ts
│   │       ├── SpeakWithSanta.tsx
│   │       └── BecomeSanta.tsx
│   ├── components/
│   │   └── ui/
│   │       └── snowfall-background.tsx
│   ├── hooks/
│   │   ├── useRecorder.ts
│   │   ├── useBilingualText.ts
│   │   └── useClearLocalStorage.ts
│   ├── services/
│   │   └── apiClient.ts
│   ├── contexts/
│   │   └── SessionContext.tsx
│   └── utils/
│       ├── storage.ts
│       └── validators.ts
└── functions/
    ├── santa-chat.js
    ├── elf-portrait.js
    ├── santa-portrait.js
    └── send-photo-email.js
```

## Key Features

### 1. Snowfall Animation
- Replace blinking stars with snowfall
- Slow falling speed
- Slight left-right random movement
- Not dense/thick
- Smooth, gentle animation
- Uses canvas or CSS animations with Framer Motion

### 2. Activity: Speak with Santa
**Flow:**
1. Display Santa image
2. Bilingual prompt (Eng/Thai): "What do you want for Christmas?"
3. Student records speech
4. AI Santa responds: "Ho Ho Ho, [positive response], and I want you to become my friend elf!"
5. Camera capture
6. Transform user into Christmas elf (colorful, Christmas-themed)
7. Photo based on speech input
8. Send to AI for generation
9. Email functionality

**Technical:**
- Uses `/santa-chat` endpoint for AI response
- Uses `/elf-portrait` endpoint for image generation
- Camera detection and selection
- Email sending via `/send-photo-email`

### 3. Activity: Become Santa
**Flow:**
1. Bilingual prompt (Eng/Thai): "What does Christmas mean to you and why is it important to celebrate?"
2. Student records speech
3. Camera capture
4. Gender detection or manual selection
5. Transform:
   - **Males**: Santa with belly and beard
   - **Females**: Female Santa in skirt, NO beard
6. Photo based on speech input
7. Send to AI for generation
8. Email functionality

**Technical:**
- Uses `/santa-portrait` endpoint
- Gender-aware transformation
- Camera detection and selection
- Email sending via `/send-photo-email`

## Design Specifications

### Colors
- **Background**: Christmas red (`#DC2626` or `#B91C1C`)
- **Activity Cards**: White borders (`border-white`)
- **Text**: White with Christmas accents (green `#16A34A`, gold `#F59E0B`)
- **Snow**: White (`#FFFFFF`)

### Styling
- Christmas-themed UI
- Festive, colorful design
- White borders on activity cards
- Red background throughout

## Environment Variables
Same as open-house project:
- `GMAIL_USER` - Gmail account for sending emails
- `GMAIL_APP_PASSWORD` - Gmail app password
- `GMAIL_FROM_NAME` - Email sender name (default: "Christmas AI")
- `OPENROUTER_API_KEY` - For AI chat and image generation
- `ASSEMBLYAI_API_KEY` - For speech transcription

## API Endpoints

### `/api/santa-chat`
- Input: `{ audioBlob: string }`
- Output: `{ transcript: string, response: string }`
- Uses AssemblyAI for transcription
- Uses OpenRouter for Santa AI response

### `/api/elf-portrait`
- Input: `{ photoDataUrl: string, transcript: string }`
- Output: `{ styledImageUrl: string }`
- Transforms user into Christmas elf based on speech

### `/api/santa-portrait`
- Input: `{ photoDataUrl: string, transcript: string, gender: 'male' | 'female' }`
- Output: `{ styledImageUrl: string }`
- Transforms user into Santa (male with beard/belly, female with skirt/no beard)

### `/api/send-photo-email`
- Input: `{ email: string, styledImageUrl: string, characterType: 'elf' | 'santa' }`
- Output: `{ delivered: boolean }`
- Sends Christmas-themed email with portrait

## Implementation Steps

1. ✅ Create project structure
2. ✅ Copy base configuration files
3. ✅ Create snowfall component
4. ✅ Create Home page with snowfall
5. ✅ Create ActivityLayout with snowfall
6. ✅ Create SpeakWithSanta activity
7. ✅ Create BecomeSanta activity
8. ✅ Create backend functions
9. ✅ Test camera detection
10. ✅ Test email sending
11. ✅ Apply Christmas styling

## Dependencies
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- React Router
- Same as open-house project

