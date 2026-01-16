from http.server import BaseHTTPRequestHandler
import json
import yt_dlp
import os
import tempfile

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        self.wfile.write(b"API Running")


    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
        except json.JSONDecodeError:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'{"error": "Invalid JSON"}')
            return

        url = data.get('url', '')

        # Basic Validation
        if not ("youtube.com" in url or "youtu.be" in url):
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Invalid YouTube URL"}).encode())
            return

        # Handle Cookies from Environment Variable
        cookie_file_path = None
        cookies_env = os.environ.get('YOUTUBE_COOKIES')
        
        if cookies_env:
            # Create a temp file for cookies
            try:
                # Use a proper temporary file that cleans up automatically would be good, 
                # but yt-dlp needs a path. We'll use try/finally to clean up.
                fd, cookie_file_path = tempfile.mkstemp(suffix='.txt', text=True)
                with os.fdopen(fd, 'w') as f:
                    # If the env var is just the content, write it.
                    # If it's a JSON string, we might need to parse, but usually people copy Netscape format.
                    # We assume Netscape format for simplicity as it's standard for yt-dlp.
                    f.write(cookies_env)
            except Exception as e:
                print(f"Error creating cookie file: {e}")
                cookie_file_path = None

        try:
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
                # 'ios' is currently less blocked than 'android' or 'web' for some endpoints
                'extractor_args': {
                    'youtube': {
                        'player_client': ['ios', 'web'],
                        'player_skip': ['webpage', 'configs'], 
                    }
                },
                
                # HEADERS to look like a real browser/device
                'user_agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
            }

            # Add cookies if available
            if cookie_file_path:
                ydl_opts['cookiefile'] = cookie_file_path

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
                # Get best audio
                formats = info.get('formats', [])
                # Filter for audio-only
                audio_formats = [f for f in formats if f.get('acodec') != 'none' and f.get('vcodec') == 'none']
                # Fallback to any format with audio
                if not audio_formats:
                    audio_formats = [f for f in formats if f.get('acodec') != 'none']
                
                if not audio_formats:
                    raise Exception("No audio formats found")

                best_audio = max(audio_formats, key=lambda f: f.get('abr', 0) or 0)
                
                # File Size Calculation
                filesize_mb = "Unknown"
                if best_audio.get('filesize'):
                     filesize_mb = f"{best_audio['filesize'] / (1024 * 1024):.2f}"
                elif best_audio.get('filesize_approx'):
                     filesize_mb = f"{best_audio['filesize_approx'] / (1024 * 1024):.2f}"

                response_data = {
                    "success": True,
                    "title": info.get('title', 'Unknown Title'),
                    "author": info.get('uploader', 'Unknown Author'),
                    "duration": info.get('duration', 0),
                    "downloadUrl": best_audio.get('url'),
                    "fileSize": filesize_mb,
                    "quality": f"{int(best_audio.get('abr', 128))}kbps",
                    "container": best_audio.get('ext', 'm4a') # iOS usually prefers m4a/aac
                }

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode())

        except Exception as e:
            error_message = str(e)
            print(f"Error: {error_message}")
            
            status_code = 500
            if "Sign in" in error_message or "bot" in error_message:
                status_code = 403
                error_message = "YouTube anti-bot active. Please configure cookies in Vercel."
            elif "Private video" in error_message:
                status_code = 403
            
            self.send_response(status_code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                "error": "Conversion Failed",
                "details": error_message
            }).encode())
            
        finally:
            # Clean up temp cookie file
            if cookie_file_path and os.path.exists(cookie_file_path):
                try:
                    os.unlink(cookie_file_path)
                except:
                    pass
