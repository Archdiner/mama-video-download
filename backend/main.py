from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VideoURL(BaseModel):
    url: str

@app.get("/")
def root():
    return {"status": "Chai MP3 Converter API ☕"}

@app.post("/api/convert")
async def convert(video: VideoURL):
    url = video.url
    
    if not ("youtube.com" in url or "youtu.be" in url):
        raise HTTPException(400, "Invalid YouTube URL")
    
    try:
        # Anti-bot detection config
        ydl_opts = {
            'format': 'bestaudio/best',
            'quiet': True,
            'no_warnings': True,
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'referer': 'https://www.youtube.com/',
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Sec-Fetch-Mode': 'navigate',
            },
            'extractor_args': {
                'youtube': {
                    'player_client': ['android', 'web'],
                    'player_skip': ['webpage', 'configs'],
                }
            },
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            formats = info.get('formats', [])
            audio_formats = [f for f in formats if f.get('acodec') != 'none' and f.get('vcodec') == 'none']
            
            if not audio_formats:
                audio_formats = [f for f in formats if f.get('acodec') != 'none']
            
            if not audio_formats:
                raise HTTPException(500, "No audio formats available")
            
            best_audio = max(audio_formats, key=lambda f: f.get('abr', 0) or 0)
            
            filesize_mb = "Unknown"
            if best_audio.get('filesize'):
                filesize_mb = f"{best_audio['filesize'] / (1024 * 1024):.2f}"
            elif best_audio.get('filesize_approx'):
                filesize_mb = f"{best_audio['filesize_approx'] / (1024 * 1024):.2f}"
            
            return {
                "success": True,
                "title": info.get('title', 'Unknown'),
                "author": info.get('uploader', 'Unknown'),
                "duration": info.get('duration', 0),
                "downloadUrl": best_audio.get('url'),
                "fileSize": filesize_mb,
                "quality": f"{int(best_audio.get('abr', 128))}kbps",
                "container": best_audio.get('ext', 'webm')
            }
            
    except Exception as e:
        if "bot" in str(e).lower() or "sign in" in str(e).lower():
            # Fallback to Android-only
            try:
                ydl_opts = {
                    'format': 'bestaudio/best',
                    'quiet': True,
                    'extractor_args': {'youtube': {'player_client': ['android']}},
                }
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=False)
                    formats = info.get('formats', [])
                    audio = [f for f in formats if f.get('acodec') != 'none']
                    best = max(audio, key=lambda f: f.get('abr', 0) or 0)
                    
                    return {
                        "success": True,
                        "title": info.get('title', 'Unknown'),
                        "author": info.get('uploader', 'Unknown'),
                        "duration": info.get('duration', 0),
                        "downloadUrl": best.get('url'),
                        "fileSize": "Unknown",
                        "quality": f"{int(best.get('abr', 128))}kbps",
                        "container": best.get('ext', 'webm')
                    }
            except:
                pass
        
        raise HTTPException(500, f"Failed: {str(e)}")
