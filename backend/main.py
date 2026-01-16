from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import os

app = FastAPI(title="Chai MP3 Converter API")

# CORS configuration
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
def read_root():
    return {"status": "Chai MP3 Converter API is running ☕"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/convert")
async def convert_video(video: VideoURL):
    """
    Convert YouTube video to MP3 and return download info
    """
    url = video.url
    
    # Validate YouTube URL
    if not ("youtube.com" in url or "youtu.be" in url):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    
    try:
        # Enhanced yt-dlp options to bypass bot detection
        ydl_opts = {
            'format': 'bestaudio/best',
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            # Anti-bot detection headers
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'referer': 'https://www.youtube.com/',
            # Use oauth for authentication (bypasses bot detection)
            'username': 'oauth2',
            'password': '',
            # Additional headers
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-us,en;q=0.5',
                'Sec-Fetch-Mode': 'navigate',
            },
            # Bypass age-gate and geo-restrictions
            'age_limit': None,
            'geo_bypass': True,
            # Use extractor args to bypass restrictions
            'extractor_args': {
                'youtube': {
                    'player_client': ['android', 'web'],
                    'player_skip': ['webpage', 'configs'],
                }
            },
        }
        
        # Extract video info without downloading
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Get best audio format
            formats = info.get('formats', [])
            audio_formats = [f for f in formats if f.get('acodec') != 'none' and f.get('vcodec') == 'none']
            
            if not audio_formats:
                # Fallback to any format with audio
                audio_formats = [f for f in formats if f.get('acodec') != 'none']
            
            if not audio_formats:
                raise HTTPException(status_code=500, detail="No audio formats available")
            
            # Get best quality audio
            best_audio = max(audio_formats, key=lambda f: f.get('abr', 0) or 0)
            
            # Calculate file size
            filesize_mb = "Unknown"
            if best_audio.get('filesize'):
                filesize_mb = f"{best_audio['filesize'] / (1024 * 1024):.2f}"
            elif best_audio.get('filesize_approx'):
                filesize_mb = f"{best_audio['filesize_approx'] / (1024 * 1024):.2f}"
            
            return {
                "success": True,
                "title": info.get('title', 'Unknown Title'),
                "author": info.get('uploader', 'Unknown Author'),
                "duration": info.get('duration', 0),
                "downloadUrl": best_audio.get('url'),
                "fileSize": filesize_mb,
                "quality": f"{int(best_audio.get('abr', 128))}kbps",
                "container": best_audio.get('ext', 'webm')
            }
            
    except yt_dlp.utils.DownloadError as e:
        error_msg = str(e)
        if "bot" in error_msg.lower() or "sign in" in error_msg.lower():
            # Try alternative method with different player client
            return await try_alternative_extraction(url)
        elif "Private video" in error_msg:
            raise HTTPException(status_code=403, detail="Private videos cannot be downloaded")
        elif "age" in error_msg.lower():
            raise HTTPException(status_code=403, detail="Age-restricted videos cannot be downloaded")
        elif "unavailable" in error_msg.lower():
            raise HTTPException(status_code=404, detail="Video is unavailable or has been removed")
        else:
            raise HTTPException(status_code=500, detail=f"Download error: {error_msg}")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process video: {str(e)}")

async def try_alternative_extraction(url: str):
    """
    Alternative extraction method using different player clients
    """
    try:
        # Use Android client which is less likely to be blocked
        ydl_opts = {
            'format': 'bestaudio/best',
            'quiet': True,
            'no_warnings': True,
            'extractor_args': {
                'youtube': {
                    'player_client': ['android'],
                }
            },
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            formats = info.get('formats', [])
            audio_formats = [f for f in formats if f.get('acodec') != 'none']
            
            if not audio_formats:
                raise HTTPException(status_code=500, detail="YouTube is blocking requests. Try a different video or try again later.")
            
            best_audio = max(audio_formats, key=lambda f: f.get('abr', 0) or 0)
            
            filesize_mb = "Unknown"
            if best_audio.get('filesize'):
                filesize_mb = f"{best_audio['filesize'] / (1024 * 1024):.2f}"
            
            return {
                "success": True,
                "title": info.get('title', 'Unknown Title'),
                "author": info.get('uploader', 'Unknown Author'),
                "duration": info.get('duration', 0),
                "downloadUrl": best_audio.get('url'),
                "fileSize": filesize_mb,
                "quality": f"{int(best_audio.get('abr', 128))}kbps",
                "container": best_audio.get('ext', 'webm')
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail="YouTube is blocking requests. This is a temporary issue. Try again in a few minutes.")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
