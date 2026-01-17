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

console.log('Downloading yt-dlp...');

const file = fs.createWriteStream(ytDlpPath);

https.get(downloadUrl, (response) => {
    // Handle redirects
    if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => {
                    console.log('Download completed.');
                    fs.chmodSync(ytDlpPath, '755');
                    console.log('Made executable.');
                });
            });
        });
    } else {
        response.pipe(file);
        file.on('finish', () => {
            file.close(() => {
                console.log('Download completed.');
                fs.chmodSync(ytDlpPath, '755');
                console.log('Made executable.');
            });
        });
    }
}).on('error', (err) => {
    fs.unlink(ytDlpPath, () => { }); // Delete the file async. (But we don't check result)
    console.error('Error downloading yt-dlp:', err.message);
    process.exit(1);
});
