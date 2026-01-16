const express = require('express');
const router = express.Router();
const ytdl = require('@distube/ytdl-core');

router.post('/convert', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // Basic validation
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        // Validate URL with ytdl-core
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        // Get video info
        const info = await ytdl.getInfo(url);

        // Filter for audio-only formats
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

        if (!audioFormats.length) {
            return res.status(500).json({ error: 'No audio formats available' });
        }

        // Get best audio format
        const bestAudio = audioFormats.reduce((prev, current) => {
            return (parseInt(current.audioBitrate) > parseInt(prev.audioBitrate)) ? current : prev;
        });

        // Calculate file size in MB
        const fileSizeMB = bestAudio.contentLength
            ? (parseInt(bestAudio.contentLength) / (1024 * 1024)).toFixed(2)
            : 'Unknown';

        // Return video info and download URL
        res.status(200).json({
            success: true,
            title: info.videoDetails.title,
            author: info.videoDetails.author.name,
            duration: parseInt(info.videoDetails.lengthSeconds),
            downloadUrl: bestAudio.url,
            fileSize: fileSizeMB,
            quality: `${bestAudio.audioBitrate}kbps`,
            container: bestAudio.container
        });

    } catch (error) {
        console.error('Conversion error:', error);

        if (error.message.includes('age')) {
            return res.status(403).json({ error: 'Age-restricted videos cannot be downloaded' });
        }

        if (error.message.includes('private')) {
            return res.status(403).json({ error: 'Private videos cannot be downloaded' });
        }

        res.status(500).json({
            error: 'Failed to process video',
            details: error.message
        });
    }
});

module.exports = router;
