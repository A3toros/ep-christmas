# Christmas AI Project

A Christmas-themed AI project featuring snowfall animations, bilingual prompts, AI Santa interactions, and camera-based transformations.

## Features

- **Snowfall Animation**: Slow, gentle snowfall with slight left-right movement
- **Speak with Santa**: Students tell Santa their Christmas wishes and become elves
- **Become Santa**: Students share what Christmas means to them and transform into Santa
- **Camera Detection**: Automatic camera detection and selection
- **Email Sending**: Send generated portraits via email

## Tech Stack

- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Vite
- Netlify Functions

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install function dependencies:
```bash
cd functions
npm install
cd ..
```

3. Set up environment variables in Netlify:
   - `GMAIL_USER` - Gmail account for sending emails
   - `GMAIL_APP_PASSWORD` - Gmail app password
   - `GMAIL_FROM_NAME` - Email sender name (default: "Christmas AI")
   - `OPENROUTER_API_KEY` - For AI chat and image generation
   - `ASSEMBLYAI_API_KEY` - For speech transcription

4. Run development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Project Structure

```
ep-christmas/
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── snowfall-background.tsx
│   ├── routes/
│   │   ├── Home.tsx
│   │   ├── ActivityLayout.tsx
│   │   └── activities/
│   │       ├── activityList.ts
│   │       ├── SpeakWithSanta.tsx
│   │       └── BecomeSanta.tsx
│   ├── contexts/
│   ├── hooks/
│   ├── services/
│   └── utils/
└── functions/
    ├── santa-chat.js
    ├── elf-portrait.js
    ├── santa-portrait.js
    └── send-photo-email.js
```

## Activities

### 1. Speak with Santa
- Bilingual prompt (Eng/Thai): "What do you want for Christmas?"
- Student records speech
- AI Santa responds positively and asks them to become an elf
- Camera capture transforms user into colorful Christmas elf
- Email functionality

### 2. Become Santa
- Bilingual prompt (Eng/Thai): "What does Christmas mean to you?"
- Student records speech
- Camera capture transforms:
  - **Males**: Santa with beard and belly
  - **Females**: Female Santa in skirt, NO beard
- Email functionality

## Design

- **Background**: Christmas red (`#DC2626`)
- **Activity Cards**: White borders (`border-2 border-white`)
- **Snowfall**: Slow, gentle, not dense
- **Colors**: Red, green, gold Christmas theme

## API Endpoints

- `POST /api/santa-chat` - Process speech and get Santa's response
- `POST /api/elf-portrait` - Generate elf portrait
- `POST /api/santa-portrait` - Generate Santa portrait
- `POST /api/send-photo-email` - Send portrait via email

## License

MIT

