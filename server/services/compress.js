const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const processFile = (filePath, jobId, callback) => {
    fs.stat(filePath, (err, stats) => {
        if (err) return callback(err);

        const fileSizeMB = stats.size / (1024 * 1024);
        const fileName = path.basename(filePath);

        // Return object structure
        const result = {
            path: filePath,
            filename: fileName,
            originalName: fileName, // We should update this with real title later
            size: `${fileSizeMB.toFixed(2)} MB`,
            compressed: false
        };

        if (fileSizeMB > 25) {
            console.log(`File is ${fileSizeMB.toFixed(2)}MB, compressing...`);

            const tempPath = filePath.replace('.mp3', '_compressed.mp3');

            ffmpeg(filePath)
                .audioBitrate('128k') // 128kbps is usually good enough for speech/general
                .save(tempPath)
                .on('end', () => {
                    // Replace original with compressed
                    fs.unlink(filePath, (err) => {
                        if (err) console.error('Error deleting original:', err);

                        fs.rename(tempPath, filePath, (err) => {
                            if (err) return callback(err);

                            // Get new size
                            fs.stat(filePath, (err, newStats) => {
                                result.size = `${(newStats.size / (1024 * 1024)).toFixed(2)} MB`;
                                result.compressed = true;
                                callback(null, result);
                            });
                        });
                    });
                })
                .on('error', (err) => {
                    console.error('Compression error:', err);
                    // If compression fails, return original
                    callback(null, result);
                });
        } else {
            console.log(`File is ${fileSizeMB.toFixed(2)}MB, no compression needed.`);
            callback(null, result);
        }
    });
};

module.exports = { processFile };
