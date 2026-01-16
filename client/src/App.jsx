import React, { useState } from 'react';
import axios from 'axios';
import UrlInput from './components/UrlInput';
import DownloadCard from './components/DownloadCard';
import ChaiCup from './components/ChaiCup';
import './App.css';

const API_Base = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleConvert = async (url) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(`${API_Base}/convert`, { url });
      setResult(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to convert video');
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

export default App;
