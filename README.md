# Chai MP3 Converter ☕

A beautiful, mobile-first YouTube to MP3 converter with a cozy chai theme.

## 🎯 Working Solution

This app uses **RapidAPI's YouTube MP3 Downloader API** - the same proven solution used by all successful Vercel YouTube converters.

## ⚙️ Setup Instructions

### 1. Get a Free RapidAPI Key

1. Go to [RapidAPI YouTube MP3 Downloader](https://rapidapi.com/ytjar/api/youtube-mp3-downloader2)
2. Click "Subscribe to Test"
3. Choose the **FREE plan** (500 requests/month)
4. Copy your API key

### 2. Add API Key to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add a new variable:
   - **Name**: `RAPIDAPI_KEY`
   - **Value**: `your-api-key-here`
4. Click **Save**
5. Redeploy your project

### 3. Local Development

Create a `.env.local` file in the root:
```
RAPIDAPI_KEY=your-api-key-here
```

Then run:
```bash
cd client
npm install
npm run dev
```

## Features

- 🎵 High-quality MP3 downloads (320kbps)
- ☕ Beautiful chai-themed UI
- 📱 Mobile-first responsive design
- ⚡ Blazing fast conversion
- 🎨 Glassmorphism and smooth animations

## Tech Stack

- **Frontend**: React + Vite
- **API**: Vercel Serverless Functions + RapidAPI
- **Styling**: Custom CSS with chai aesthetic

## Deployment

Push to GitHub and Vercel will auto-deploy. Don't forget to add the `RAPIDAPI_KEY` environment variable!

## License

MIT

---

Made with ❤️ and chai
