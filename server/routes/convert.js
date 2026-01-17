const express = require('express');
const router = express.Router();
const { startDownload, getJob } = require('../services/ytdlp');

router.post('/convert', (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // Basic validation
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        const jobId = startDownload(url);
        res.json({ jobId, status: 'started' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to start conversion' });
    }
});

router.get('/status/:jobId', (req, res) => {
    const { jobId } = req.params;
    const job = getJob(jobId);

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
});

module.exports = router;
