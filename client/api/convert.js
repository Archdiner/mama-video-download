import ytdl from '@distube/ytdl-core';

// Set timeout for Vercel serverless function
export const config = {
    maxDuration: 30, // 30 seconds max
};

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // Basic YouTube URL validation
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        // Validate URL with ytdl-core
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        console.log('Fetching info for:', url);

        // Get video info with timeout
        const info = await Promise.race([
            ytdl.getInfo(url),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout - video took too long to process')), 25000)
            )
        ]);

        console.log('Got video info:', info.videoDetails.title);

        // Filter for audio-only formats
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

        if (!audioFormats.length) {
            return res.status(500).json({ error: 'No audio formats available for this video' });
        }

        // Get best audio format
        const bestAudio = audioFormats.reduce((prev, current) => {
            return (parseInt(current.audioBitrate || 0) > parseInt(prev.audioBitrate || 0)) ? current : prev;
        });

        // Calculate file size in MB
        const fileSizeMB = bestAudio.contentLength
            ? (parseInt(bestAudio.contentLength) / (1024 * 1024)).toFixed(2)
            : 'Unknown';

        console.log('Returning success response');

        // Return video info and download URL
        res.status(200).json({
            success: true,
            title: info.videoDetails.title,
            author: info.videoDetails.author.name,
            duration: parseInt(info.videoDetails.lengthSeconds),
            downloadUrl: bestAudio.url,
            fileSize: fileSizeMB,
            quality: `${bestAudio.audioBitrate || '128'}kbps`,
            container: bestAudio.container || 'webm'
        });

    } catch (error) {
        console.error('Conversion error:', error);

        if (error.message.includes('timeout')) {
            return res.status(408).json({
                error: 'Video processing timeout',
                details: 'This video is taking too long to process. Try a shorter video or try again later.'
            });
        }

        if (error.message.includes('age')) {
            return res.status(403).json({ error: 'Age-restricted videos cannot be downloaded' });
        }

        if (error.message.includes('private')) {
            return res.status(403).json({ error: 'Private videos cannot be downloaded' });
        }

        if (error.message.includes('unavailable')) {
            return res.status(404).json({ error: 'Video is unavailable or has been removed' });
        }

        res.status(500).json({
            error: 'Failed to process video',
            details: error.message
        });
    }
}
