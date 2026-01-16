import React from 'react';

const DownloadCard = ({ result, onReset }) => {
    if (!result) return null;

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="card">
            <div className="download-info">
                <div className="thumbnail-placeholder" style={{
                    background: 'linear-gradient(135deg, #d35400 0%, #e67e22 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '2rem',
                    boxShadow: '0 4px 15px rgba(211, 84, 0, 0.3)',
                    borderRadius: '16px'
                }}>
                    🎵
                </div>

                <div className="file-details">
                    <div className="file-title">{result.title}</div>
                    <div className="file-meta">
                        {result.author} • {formatDuration(result.duration)}
                    </div>
                    <div className="file-meta">
                        {result.fileSize} MB • {result.quality}
                    </div>
                </div>
            </div>

            <a
                href={result.downloadUrl}
                className="primary-btn"
                style={{ textDecoration: 'none' }}
                download={`${result.title}.${result.container}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                Download MP3
            </a>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                    onClick={onReset}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: '0.9rem'
                    }}
                >
                    Convert another video
                </button>
            </div>
        </div>
    );
};

export default DownloadCard;
