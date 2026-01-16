from http.server import BaseHTTPRequestHandler
import json
import yt_dlp
import urllib.parse

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Handle CORS preflight
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

        try:
            # Get request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            url = data.get('url', '')
            
            # Validate YouTube URL
            if not ("youtube.com" in url or "youtu.be" in url):
                response = {"error": "Invalid YouTube URL"}
                self.wfile.write(json.dumps(response).encode())
                return
            
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
                    audio_formats = [f for f in formats if f.get('acodec') != 'none']
                
                if not audio_formats:
                    response = {"error": "No audio formats available"}
                    self.wfile.write(json.dumps(response).encode())
                    return
                
                # Get best quality audio
                best_audio = max(audio_formats, key=lambda f: f.get('abr', 0) or 0)
                
                # Calculate file size
                filesize_mb = "Unknown"
                if best_audio.get('filesize'):
                    filesize_mb = f"{best_audio['filesize'] / (1024 * 1024):.2f}"
                elif best_audio.get('filesize_approx'):
                    filesize_mb = f"{best_audio['filesize_approx'] / (1024 * 1024):.2f}"
                
                response = {
                    "success": True,
                    "title": info.get('title', 'Unknown Title'),
                    "author": info.get('uploader', 'Unknown Author'),
                    "duration": info.get('duration', 0),
                    "downloadUrl": best_audio.get('url'),
                    "fileSize": filesize_mb,
                    "quality": f"{int(best_audio.get('abr', 128))}kbps",
                    "container": best_audio.get('ext', 'webm')
                }
                
                self.wfile.write(json.dumps(response).encode())
                
        except Exception as e:
            error_msg = str(e)
            if "Private video" in error_msg:
                response = {"error": "Private videos cannot be downloaded"}
            elif "age" in error_msg.lower():
                response = {"error": "Age-restricted videos cannot be downloaded"}
            elif "unavailable" in error_msg.lower():
                response = {"error": "Video is unavailable or has been removed"}
            else:
                response = {"error": f"Failed to process video: {error_msg}"}
            
            self.wfile.write(json.dumps(response).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
