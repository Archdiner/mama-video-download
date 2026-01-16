from http.server import BaseHTTPRequestHandler
import json
import yt_dlp

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        # Read request body
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        url = data.get('url', '')
        
        # Validate YouTube URL
        if not ("youtube.com" in url or "youtu.be" in url):
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Invalid YouTube URL"}).encode())
            return
        
        try:
            # Enhanced yt-dlp options to bypass bot detection
            ydl_opts = {
                'format': 'bestaudio/best',
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False,
                # Anti-bot detection
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'referer': 'https://www.youtube.com/',
                'http_headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-us,en;q=0.5',
                    'Sec-Fetch-Mode': 'navigate',
                },
                'extractor_args': {
                    'youtube': {
                        'player_client': ['android', 'web'],
                        'player_skip': ['webpage', 'configs'],
                    }
                },
            }
            
            # Extract video info
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
                # Get best audio format
                formats = info.get('formats', [])
                audio_formats = [f for f in formats if f.get('acodec') != 'none' and f.get('vcodec') == 'none']
                
                if not audio_formats:
                    audio_formats = [f for f in formats if f.get('acodec') != 'none']
                
                if not audio_formats:
                    raise Exception("No audio formats available")
                
                best_audio = max(audio_formats, key=lambda f: f.get('abr', 0) or 0)
                
                # Calculate file size
                filesize_mb = "Unknown"
                if best_audio.get('filesize'):
                    filesize_mb = f"{best_audio['filesize'] / (1024 * 1024):.2f}"
                elif best_audio.get('filesize_approx'):
                    filesize_mb = f"{best_audio['filesize_approx'] / (1024 * 1024):.2f}"
                
                result = {
                    "success": True,
                    "title": info.get('title', 'Unknown Title'),
                    "author": info.get('uploader', 'Unknown Author'),
                    "duration": info.get('duration', 0),
                    "downloadUrl": best_audio.get('url'),
                    "fileSize": filesize_mb,
                    "quality": f"{int(best_audio.get('abr', 128))}kbps",
                    "container": best_audio.get('ext', 'webm')
                }
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())
                
        except Exception as e:
            error_msg = str(e)
            if "bot" in error_msg.lower() or "sign in" in error_msg.lower():
                # Try Android-only fallback
                try:
                    ydl_opts_fallback = {
                        'format': 'bestaudio/best',
                        'quiet': True,
                        'extractor_args': {'youtube': {'player_client': ['android']}},
                    }
                    with yt_dlp.YoutubeDL(ydl_opts_fallback) as ydl:
                        info = ydl.extract_info(url, download=False)
                        formats = info.get('formats', [])
                        audio_formats = [f for f in formats if f.get('acodec') != 'none']
                        best_audio = max(audio_formats, key=lambda f: f.get('abr', 0) or 0)
                        
                        result = {
                            "success": True,
                            "title": info.get('title', 'Unknown Title'),
                            "author": info.get('uploader', 'Unknown Author'),
                            "duration": info.get('duration', 0),
                            "downloadUrl": best_audio.get('url'),
                            "fileSize": "Unknown",
                            "quality": f"{int(best_audio.get('abr', 128))}kbps",
                            "container": best_audio.get('ext', 'webm')
                        }
                        
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')
                        self.end_headers()
                        self.wfile.write(json.dumps(result).encode())
                        return
                except:
                    pass
            
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": f"Failed to process video: {error_msg}"}).encode())
