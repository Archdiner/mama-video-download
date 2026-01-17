import React from 'react';

const DownloadCard = ({ result, onDownload }) => {
    if (!result) return null;

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
                    <div className="file-title">{result.originalName}</div>
                    <div className="file-meta">
                        {result.fileSize}
                        {result.compressed && <span className="tag-compressed">COMPRESSED</span>}
                    </div>
                </div>
            </div>

            <a
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${result.downloadUrl}`}
                className="primary-btn"
                style={{ textDecoration: 'none' }}
                download
                target="_blank"
                rel="noopener noreferrer"
            >
                Download MP3
            </a>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    Convert another video
                </button>
            </div>
        </div>
    );
};

export default DownloadCard;
