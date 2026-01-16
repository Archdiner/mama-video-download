import React, { useState } from 'react';

const UrlInput = ({ onConvert, isLoading }) => {
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');

    const validateUrl = (input) => {
        const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        return regex.test(input);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!url) return;

        if (!validateUrl(url)) {
            setError('Please enter a valid YouTube URL');
            return;
        }

        setError('');
        onConvert(url);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setUrl(text);
            if (validateUrl(text)) setError('');
        } catch (err) {
            console.error('Failed to read clipboard', err);
        }
    };

    return (
        <div className="card">
            <form onSubmit={handleSubmit} className="input-group">
                <div className="url-input-wrapper">
                    <input
                        type="text"
                        placeholder="Paste YouTube Link here..."
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value);
                            if (error) setError('');
                        }}
                        disabled={isLoading}
                    />
                </div>

                {error && <div style={{ color: 'var(--error)', fontSize: '0.9rem' }}>{error}</div>}

                <button
                    type="submit"
                    className="primary-btn"
                    disabled={!url || isLoading}
                >
                    {isLoading ? (
                        <span className="loading-dots">Processing<span>.</span><span>.</span><span>.</span></span>
                    ) : (
                        'Convert to MP3'
                    )}
                </button>
            </form>
        </div>
    );
};

export default UrlInput;
