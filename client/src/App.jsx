import React, { useState } from 'react';
import axios from 'axios';
import UrlInput from './components/UrlInput';
import DownloadCard from './components/DownloadCard';
import ChaiCup from './components/ChaiCup';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// API base URL from environment variable or default to localhost for dev
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function AppContent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleConvert = async (url) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('Sending request to:', `${API_BASE}/api/convert`);
      const response = await axios.post(`${API_BASE}/api/convert`,
        { url },
        { timeout: 35000 }
      );
      console.log('Response:', response.data);

      if (!response.data || !response.data.title) {
        throw new Error('Invalid response from server');
      }

      setResult(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Conversion error:', err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to convert video';
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError('');
  };

  return (
    <div className="app-container">
      <ChaiCup />
      <h1>Chai MP3 Converter</h1>

      {!result && !error && (
        <UrlInput onConvert={handleConvert} isLoading={loading} />
      )}

      {result && (
        <DownloadCard result={result} onReset={handleReset} />
      )}

      {error && (
        <div className="card" style={{ borderColor: 'var(--error)' }}>
          <div style={{ color: 'var(--error)', textAlign: 'center' }}>
            ⚠️ {error}
            <button
              onClick={handleReset}
              style={{
                display: 'block',
                margin: '1rem auto 0',
                background: 'transparent',
                border: '1px solid var(--text-secondary)',
                color: 'var(--text-secondary)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <div style={{
        textAlign: 'center',
        marginTop: '2rem',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        opacity: 0.8
      }}>
        ❤️ dear mama, for any tech support I charge 1 cup of chai
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
