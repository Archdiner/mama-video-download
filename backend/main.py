from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import os

app = FastAPI(title="Chai MP3 Converter API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your Vercel domain
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
        # Configure yt-dlp options
        ydl_opts = {
            'format': 'bestaudio/best',
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
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
        if "Private video" in error_msg:
            raise HTTPException(status_code=403, detail="Private videos cannot be downloaded")
        elif "age" in error_msg.lower():
            raise HTTPException(status_code=403, detail="Age-restricted videos cannot be downloaded")
        elif "unavailable" in error_msg.lower():
            raise HTTPException(status_code=404, detail="Video is unavailable or has been removed")
        else:
            raise HTTPException(status_code=500, detail=f"Download error: {error_msg}")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process video: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
