const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const getBestAudioFormat = (url) => {
    // We'll let yt-dlp pick the best audio, usually it handles this well with -f bestaudio
    return 'bestaudio';
};

// Map to store active jobs
const jobs = new Map();

const startDownload = (url) => {
    const jobId = uuidv4();
    const outputTemplate = path.join(__dirname, '../downloads', `${jobId}.%(ext)s`);

    // Initial job state
    jobs.set(jobId, {
        id: jobId,
        status: 'extracting',
        progress: 0,
        message: 'Starting extraction...',
        url
    });

    // Command to download audio only, converting to mp3 immediately involves ffmpeg
    // We will download as best audio first, then convert/compress if needed.
    // Actually, yt-dlp can convert to mp3 directly using --extract-audio --audio-format mp3
    // We'll use that for simplicity, but we might check size later.

    // Note: To get progress, we can use the --newline flag and parse output
    const ytDlpPath = path.join(__dirname, '../bin/yt-dlp');
    // Fallback to global command if local doesn't exist (optional, but good for local dev if not running postinstall)
    const executable = fs.existsSync(ytDlpPath) ? ytDlpPath : 'yt-dlp';

    // Get ffmpeg path from ffmpeg-static
    const ffmpegPath = require('ffmpeg-static');

    const command = `${executable} -x --audio-format mp3 --audio-quality 0 --newline --ffmpeg-location "${ffmpegPath}" -o "${outputTemplate}" "${url}"`;

    console.log(`Executing: ${command}`); // Log command for debug

    const process = exec(command);

    let logs = [];

    process.stdout.on('data', (data) => {
        logs.push(data);
        const lines = data.split('\n');
        lines.forEach(line => {
            if (line.includes('[download]')) {
                const percentMatch = line.match(/(\d+\.\d+)%/);
                if (percentMatch) {
                    const percent = parseFloat(percentMatch[1]);
                    updateJob(jobId, {
                        status: 'converting',
                        progress: percent / 2, // First 50% is download
                        message: `Downloading: ${percent}%`
                    });
                }
            }
        });
    });

    process.stderr.on('data', (data) => {
        logs.push(`STDERR: ${data}`);
        console.error(`yt-dlp stderr: ${data}`);
    });

    process.on('close', (code) => {
        if (code === 0) {
            // Success
            // Find the file (it should be .mp3 now)
            const filePath = path.join(__dirname, '../downloads', `${jobId}.mp3`);

            if (fs.existsSync(filePath)) {
                // Now check size and compress if needed
                updateJob(jobId, { status: 'compressing', progress: 50, message: 'Checking file size...' });
                require('./compress').processFile(filePath, jobId, (err, result) => {
                    if (err) {
                        failJob(jobId, err.message);
                    } else {
                        updateJob(jobId, {
                            status: 'ready',
                            progress: 100,
                            message: 'Conversion complete!',
                            filename: result.filename,
                            originalName: result.originalName, // We need to get title from yt-dlp json first actually
                            downloadUrl: `/download/${path.basename(result.path)}`,
                            compressed: result.compressed,
                            fileSize: result.size
                        });
                    }
                });
            } else {
                console.error(`Output file not found: ${filePath}`);
                console.error('--- LOGS START ---');
                console.error(logs.join(''));
                console.error('--- LOGS END ---');

                // List files in directory for debugging
                const dir = path.dirname(filePath);
                fs.readdir(dir, (err, files) => {
                    if (files) console.error(`Files in ${dir}:`, files);
                });
                failJob(jobId, 'Output file not found - conversion likely failed. Check server logs.');
            }
        } else {
            console.error(`yt-dlp failed with code ${code}`);
            console.error('--- LOGS START ---');
            console.error(logs.join(''));
            console.error('--- LOGS END ---');
            failJob(jobId, `yt-dlp exited with code ${code}`);
        }
    });

    return jobId;
};

const updateJob = (id, data) => {
    if (jobs.has(id)) {
        jobs.set(id, { ...jobs.get(id), ...data });
    }
};

const failJob = (id, error) => {
    if (jobs.has(id)) {
        jobs.set(id, { ...jobs.get(id), status: 'error', error });
    }
};

const getJob = (id) => jobs.get(id);

module.exports = { startDownload, getJob };
