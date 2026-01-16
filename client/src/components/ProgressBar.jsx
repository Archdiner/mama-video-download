import React from 'react';

const ProgressBar = ({ progress, status }) => {
    return (
        <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{Math.round(progress)}%</span>
            </div>

            <div className="progress-track">
                <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="status-text">
                {status === 'extracting' && 'steeping the tea leaves... (extracting)'}
                {status === 'converting' && 'adding spices... (converting)'}
                {status === 'compressing' && 'straining the chai... (compressing >25MB)'}
                {status === 'ready' && 'chai is ready! served hot ☕'}
            </div>
        </div>
    );
};

export default ProgressBar;
