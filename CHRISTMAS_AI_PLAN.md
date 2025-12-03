# Christmas AI Project Plan

## Overview
Create a new Christmas-themed AI project based on the open-house example structure. Replace space theme with Christmas theme, focusing on 2 main activities instead of carousel.

## Project Structure
```
christmas-ai/
├── package.json (copy from open-house)
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── index.html
├── .env (same env names as open-house)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── routes/
│   │   ├── Home.tsx
│   │   └── activities/
│   │       ├── activityList.ts (2 activities only)
│   │       ├── SpeakWithSanta.tsx
│   │       └── BecomeSanta.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── SnowfallBackground.tsx (replace stars)
│   │   │   └── ConfettiOverlay.tsx
│   │   └── home/
│   │       └── ActivityCards.tsx (no carousel)
│   ├── contexts/
│   │   ├── SessionContext.tsx
│   │   ├── AudioContext.tsx
│   │   └── AIRequestContext.tsx
│   ├── hooks/
│   │   ├── useRecorder.ts
│   │   ├── useConfetti.ts
│   │   └── useBilingualText.ts
│   ├── services/
│   │   └── apiClient.ts
│   └── utils/
│       ├── validators.ts
│       ├── storage.ts
│       └── carousel.ts
├── public/
│   ├── pics/
│   │   ├── santa-claus.png
│   │   ├── santa-female.png
│   │   └── banner-christmas.webp
│   └── ...
└── functions/ (copy from open-house)
```

## Key Changes from Open-House

### 1. Visual Theme
- **Background**: Christmas red instead of dark blue/space theme
- **Borders**: White borders on activity cards
- **Snowfall**: Replace blinking stars with gentle falling snow
- **Colors**: Red, white, green Christmas palette

### 2. Activities (2 total, no carousel)

#### Activity 1: Speak with Santa
- **Prompt**: Bilingual (Eng/Thai) "What do you want for Christmas?"
- **Flow**: 
  1. Student speaks to Santa picture
  2. AI Santa responds: "Ho Ho Ho" + positive message + "I want you to become my friend elf"
  3. Camera captures user photo
  4. AI transforms user into Christmas elf based on speech
  5. Email option available

#### Activity 2: Become Santa
- **Prompt**: "What does Christmas mean to you and why is it important to celebrate?"
- **Flow**:
  1. Student speaks about Christmas meaning
  2. Camera captures user photo  
  3. AI transforms:
     - Males → Santa with belly and beard
     - Females → Female Santa (skirt, no beard)
  4. Email option available

### 3. Technical Requirements
- **Camera Detection**: Allow users to choose camera (same as open-house)
- **Email Functionality**: Same env names and implementation
- **Bilingual Support**: English/Thai prompts
- **AI Integration**: Speech-to-text and image generation

### 4. Component Adaptations

#### SnowfallBackground Component
```typescript
interface SnowfallBackgroundProps {
  snowDensity?: number
  fallSpeed?: number
  windEffect?: number
  className?: string
}
```
- Gentle falling animation
- Slight left-right movement
- Not dense or thick
- Slow falling speed

#### Activity Cards
- Remove carousel functionality
- Display 2 cards side by side
- Christmas theme styling
- White borders on red background

## Implementation Steps

1. **Project Setup**
   - Copy package.json and config files
   - Set up basic directory structure
   - Copy necessary contexts and hooks

2. **Visual Theme**
   - Create SnowfallBackground component
   - Update color scheme to Christmas theme
   - Create Christmas-themed assets

3. **Activities**
   - Create SpeakWithSanta component
   - Create BecomeSanta component
   - Implement camera and AI integration

4. **Integration**
   - Update activity list
   - Modify Home component
   - Test email functionality

## Environment Variables (Same as Open-House)
```
VITE_API_URL=
VITE_EMAIL_SERVICE=
VITE_EMAIL_USER=
VITE_EMAIL_PASS=
VITE_EMAIL_FROM=
```

## Netlify Functions Required

### Functions to Copy from Open-House
- `response.js` - Response helpers
- `db.js` - Database connection
- `log-event.js` - Event logging
- `openrouter.js` - AI API client
- `assemblyai.js` - Speech-to-text
- `send-photo-email.js` - Email functionality
- `debug.js` - Debug utilities
- `modelConfig.js` - Model configurations

### New Functions to Create

#### 1. `santa-chat.js` (Speak with Santa AI response)
```javascript
// Handles Santa AI responses
// Input: transcript from student
// Output: "Ho Ho Ho" + positive message + "I want you to become my friend elf"
// Uses bilingual EN/TH responses
```

#### 2. `elf-portrait.js` (Transform user to elf)
```javascript
// Based on superhero-portrait.js
// Input: photoDataUrl, transcript
// Output: Christmas elf transformation
// Style: Colorful Christmas themed, pointy ears, elf costume
// Based on speech content for elf characteristics
```

#### 3. `become-santa-portrait.js` (Transform user to Santa)
```javascript
// Based on superhero-portrait.js
// Input: photoDataUrl, transcript, gender detection
// Output: Santa transformation
// Male → Santa with belly and beard
// Female → Female Santa (skirt, no beard)
// Christmas themed styling
```

#### 4. `voice-challenge-santa.js` (Modified for Christmas)
```javascript
// Based on voice-challenge.js
// Modified prompts for Christmas activities
// Activity 1: "What do you want for Christmas?"
// Activity 2: "What does Christmas mean to you?"
```

## API Endpoints Needed
- `/api/santa-chat` (Santa AI responses)
- `/api/voice-challenge-santa` (Christmas speech analysis)
- `/api/elf-portrait` (elf transformation)
- `/api/become-santa-portrait` (Santa transformation)
- `/api/send-photo-email` (email functionality - reuse existing)

## Netlify Configuration
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "functions"

[dev]
  command = "vite"
  functions = "functions"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/pics/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## Success Criteria
- Snowfall animation working smoothly
- Both activities functional with camera
- AI transformations working correctly
- Email delivery functional
- Bilingual prompts displaying correctly
- Christmas theme consistently applied
- Netlify functions deployed and working
