# Chai MP3 Converter ☕

A beautiful, mobile-first YouTube to MP3 converter deployed entirely on Vercel.

## 🚀 Single-Platform Deployment

Everything runs on Vercel:
- **Frontend**: React + Vite
- **Backend**: Python serverless functions with yt-dlp

## Local Development

### Option 1: Full Stack (Recommended)

```bash
# Install Python dependencies
pip install -r requirements.txt

# Run Vercel dev server (serves both frontend and API)
cd client && npm install && cd ..
npx vercel dev
```

### Option 2: Frontend Only

```bash
cd client
npm install
npm run dev
```

## Deployment

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Vercel auto-detects:
   - Python API functions in `/api`
   - React frontend in `/client`
4. Deploy! ✨

**No environment variables needed** - everything just works.

## Features

- 🎵 High-quality MP3 extraction
- ☕ Beautiful chai-themed UI
- 📱 Mobile-first responsive design
- ⚡ Fast Python backend with yt-dlp
- 🎨 Glassmorphism and smooth animations
- 🔒 No third-party API dependencies
- 🆓 100% free (Vercel Hobby plan)

## Project Structure

```
├── api/
│   └── convert.py          # Python serverless function
├── client/                 # React frontend
│   ├── src/
│   └── ...
└── requirements.txt        # Python dependencies
```

## Tech Stack

- **Frontend**: React, Vite, Axios
- **Backend**: Python, yt-dlp
- **Hosting**: Vercel (serverless)

## License

MIT

---

Made with ❤️ and chai
