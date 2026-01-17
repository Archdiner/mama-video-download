const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

const binDir = path.join(__dirname, '../bin');
const ytDlpPath = path.join(binDir, 'yt-dlp');

if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
}

// URL for the latest standalone binary (Unix)
// GitHub releases usually redirect, so we need to handle that or use a direct link if possible.
// The standard download link is: https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp
const downloadUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
const ffmpegUrl = 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz'; // Static build for Linux

console.log('Downloading yt-dlp...');

const downloadFile = (url, dest, callback) => {
    const file = fs.createWriteStream(dest);
    const request = (url) => {
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                request(response.headers.location);
            } else {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(callback);
                });
            }
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            console.error(`Error downloading ${url}:`, err.message);
            process.exit(1);
        });
    };
    request(url);
};

downloadFile(downloadUrl, ytDlpPath, () => {
    console.log('yt-dlp downloaded.');
    fs.chmodSync(ytDlpPath, '755');
    console.log('Made yt-dlp executable.');

    // Check if ffmpeg is present, if not download simple static build?
    // Actually downloading and extracting tar.xz in node without dependencies is hard.
    // For Render, it's better to just use a static binary if possible or assume system providing it.
    // BUT Render native node environment DOES NOT have ffmpeg.

    // Easier approach: Use a package like `ffmpeg-static` in package.json?
    // User asked not to save files locally on server, but installing dependencies is fine.
    // Let's try to see if we can just recommend installing `ffmpeg-static` via npm.
    console.log('Installation of yt-dlp complete. Please ensure ffmpeg is available or install ffmpeg-static via npm.');
});

