# Chai MP3 Converter ☕

A beautiful, mobile-first YouTube to MP3 converter with Python FastAPI backend and React frontend.

## Architecture

- **Frontend**: React + Vite (deployed on Vercel)
- **Backend**: Python FastAPI + yt-dlp (deployed on Railway)

## Local Development

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Backend runs on `http://localhost:8000`

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Deployment

### 1. Deploy Backend (Railway)

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `mama-video-download` repository
4. Set root directory to `backend`
5. Railway will auto-detect Python and deploy
6. Copy your backend URL (e.g., `https://your-app.railway.app`)

### 2. Deploy Frontend (Vercel)

1. Go to [Vercel.com](https://vercel.com)
2. Import `mama-video-download` repository
3. **Framework Preset**: Vite
4. **Root Directory**: `client`
5. **Environment Variables**:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-url.railway.app` (from step 1)
6. Deploy!

## Features

- 🎵 High-quality MP3 extraction
- ☕ Beautiful chai-themed UI
- 📱 Mobile-first responsive design
- ⚡ Fast Python backend with yt-dlp
- 🎨 Glassmorphism and smooth animations
- 🔒 No third-party API dependencies

## Tech Stack

### Frontend
- React
- Vite
- Axios
- Custom CSS

### Backend
- FastAPI
- yt-dlp (most reliable YouTube downloader)
- uvicorn
- pydantic

## Why This Architecture?

- **Vercel free tier**: Only supports Node.js serverless (no Python)
- **Railway free tier**: Full Python support with yt-dlp
- **Best of both worlds**: Fast Vercel CDN + Reliable Python backend

## License

MIT

---

Made with ❤️ and chai
