from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import os
import tempfile
import json
import logging

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConvertRequest(BaseModel):
    url: str

@app.get("/")
async def root():
    return {"status": "API Running", "framework": "FastAPI"}

@app.get("/api/convert")
async def convert_root():
    return {"status": "API Running", "framework": "FastAPI"}

@app.post("/api/convert")
async def convert_video(request: ConvertRequest):
    url = request.url
    
    # Basic Validation
    if not ("youtube.com" in url or "youtu.be" in url):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    # Handle Cookies from Environment Variable
    cookie_file_path = None
    cookies_env = os.environ.get('YOUTUBE_COOKIES')
    
    try:
        if cookies_env:
            try:
                fd, cookie_file_path = tempfile.mkstemp(suffix='.txt', text=True)
                with os.fdopen(fd, 'w') as f:
                    f.write(cookies_env)
            except Exception as e:
                print(f"Error creating cookie file: {e}")
                cookie_file_path = None

        # PROVEN WORKING CONFIGURATION 2024
        ydl_opts = {
            'format': 'bestaudio/best',
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'nocheckcertificate': True,
            
            # TIMEOUTS (Vital for Vercel 10s limit)
            'socket_timeout': 5,
            
            # CLIENT SPOOFING
            'extractor_args': {
                'youtube': {
                    'player_client': ['ios', 'web'],
                    'player_skip': ['webpage', 'configs'], 
                }
            },
            
            # HEADERS
            'user_agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        }

        if cookie_file_path:
            ydl_opts['cookiefile'] = cookie_file_path

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            formats = info.get('formats', [])
            audio_formats = [f for f in formats if f.get('acodec') != 'none' and f.get('vcodec') == 'none']
            if not audio_formats:
                audio_formats = [f for f in formats if f.get('acodec') != 'none']
            
            if not audio_formats:
                raise Exception("No audio formats found")

            best_audio = max(audio_formats, key=lambda f: f.get('abr', 0) or 0)
            
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
                "container": best_audio.get('ext', 'm4a')
            }

    except Exception as e:
        error_message = str(e)
        status_code = 500
        if "Sign in" in error_message or "bot" in error_message:
            status_code = 403
            error_message = "YouTube anti-bot active. Please configure cookies in Vercel."
        elif "Private video" in error_message:
            status_code = 403
        
        # Log the full error for debugging
        print(f"Conversion Error: {error_message}")
        
        return JSONResponse(
            status_code=status_code,
            content={"error": "Conversion Failed", "details": error_message}
        )
        
    finally:
        # Clean up temp cookie file
        if cookie_file_path and os.path.exists(cookie_file_path):
            try:
                os.unlink(cookie_file_path)
            except:
                pass

