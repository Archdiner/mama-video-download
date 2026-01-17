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
    const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 --newline -o "${outputTemplate}" "${url}"`;

    const process = exec(command);

    process.stdout.on('data', (data) => {
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
        console.error(`yt-dlp stderr: ${data}`);
        // yt-dlp writes some progress to stderr or info
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
                failJob(jobId, 'Output file not found');
            }
        } else {
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
