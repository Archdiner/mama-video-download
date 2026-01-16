// Using RapidAPI's YouTube MP3 Downloader API
// This is the proven solution used by all working Vercel deployments

export const config = {
    maxDuration: 30,
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

    // Get RapidAPI key from environment variable
    const rapidApiKey = process.env.RAPIDAPI_KEY;

    if (!rapidApiKey) {
        return res.status(500).json({
            error: 'API key not configured',
            details: 'Please add RAPIDAPI_KEY to environment variables in Vercel dashboard'
        });
    }

    try {
        console.log('Fetching video info from RapidAPI for:', url);

        // Call RapidAPI's YouTube MP3 Downloader
        const apiUrl = `https://youtube-mp3-downloader2.p.rapidapi.com/ytmp3/ytmp3/custom/?url=${encodeURIComponent(url)}&quality=320`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': 'youtube-mp3-downloader2.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            throw new Error(`RapidAPI error: ${response.status}`);
        }

        const data = await response.json();

        console.log('Got response from RapidAPI');

        // Return standardized response
        res.status(200).json({
            success: true,
            title: data.title || 'Unknown Title',
            author: data.author || 'Unknown Author',
            duration: data.duration || 0,
            downloadUrl: data.dlink,
            fileSize: data.fsize || 'Unknown',
            quality: '320kbps',
            container: 'mp3'
        });

    } catch (error) {
        console.error('Conversion error:', error);

        if (error.message.includes('timeout')) {
            return res.status(408).json({
                error: 'Video processing timeout',
                details: 'Try a shorter video or try again later.'
            });
        }

        res.status(500).json({
            error: 'Failed to process video',
            details: error.message
        });
    }
}
