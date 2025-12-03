# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
cd functions && npm install && cd ..
```

### 2. Set Environment Variables in Netlify

Go to Netlify Dashboard → Your Site → Site settings → Environment variables

Add these variables:
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
GMAIL_FROM_NAME=Christmas AI
OPENROUTER_API_KEY=sk-or-...
ASSEMBLYAI_API_KEY=your-assemblyai-key
```

### 3. Run Locally
```bash
npm run dev
```

Visit `http://localhost:5173`

### 4. Deploy
```bash
npm run build
git push
```

Netlify will auto-deploy!

## 🎄 Features

### Activity 1: Speak with Santa
- Student tells Santa their Christmas wish
- Santa responds: "Ho Ho Ho! [positive message] I want you to become my friend elf!"
- Camera transforms student into colorful Christmas elf
- Email portrait to student

### Activity 2: Become Santa
- Student shares what Christmas means to them
- Camera transforms:
  - **Male**: Santa with beard & belly
  - **Female**: Female Santa in skirt (NO beard)
- Email portrait to student

## 🎨 Design Features

- **Snowfall**: Slow, gentle, not dense
- **Background**: Christmas red (#DC2626)
- **Borders**: White borders on activity cards
- **Colors**: Red, green, gold Christmas theme

## 📝 Notes

- Camera requires HTTPS (works on Netlify)
- Email uses Gmail SMTP
- Images generated via OpenRouter AI
- Speech transcribed via AssemblyAI

## 🐛 Common Issues

**Camera not working?**
- Use Chrome browser
- Ensure HTTPS
- Check browser permissions

**Email not sending?**
- Verify Gmail app password
- Check 2-Step Verification is enabled
- Review Netlify function logs

**Images not generating?**
- Check OpenRouter API key
- Verify API quota
- Review function logs

