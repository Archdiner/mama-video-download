# Chai MP3 Converter ☕

A beautiful, mobile-first YouTube to MP3 converter with a cozy chai theme.

## Features

- 🎵 Instant MP3 downloads from YouTube
- ☕ Beautiful chai-themed UI
- 📱 Mobile-first responsive design
- ⚡ Super fast (no server processing)
- 🎨 Glassmorphism and smooth animations

## Tech Stack

- **Frontend**: React + Vite
- **API**: Vercel Serverless Functions
- **YouTube Extraction**: ytdl-core

## Local Development

1. Navigate to the client folder:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173

## Deployment to Vercel

1. Push your code to GitHub

2. Import project to Vercel:
   - Go to https://vercel.com/new
   - Select your repository
   - Framework Preset: **Vite**
   - Root Directory: **client**
   - Click **Deploy**

That's it! Your app will be live in seconds.

## How It Works

1. User pastes a YouTube URL
2. Vercel serverless function extracts audio stream info using ytdl-core
3. Returns direct download link to best quality audio
4. User downloads instantly (no waiting for server processing!)

## Limitations

- Cannot compress files >25MB (trade-off for speed and Vercel compatibility)
- Very long videos (>15 min) may timeout on free tier

## License

MIT

---

Made with ❤️ and chai
