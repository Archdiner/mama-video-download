import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UrlInput from './components/UrlInput';
import ProgressBar from './components/ProgressBar';
import DownloadCard from './components/DownloadCard';
import ChaiCup from './components/ChaiCup';
import './App.css';

const API_Base = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

function App() {
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null); // extracting, converting, compressing, ready, error
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleConvert = async (url) => {
    setLoading(true);
    setProgress(0);
    setStatus('extracting');
    setError('');
    setResult(null);

    try {
      const response = await axios.post(`${API_Base}/convert`, { url }, { timeout: 120000 }); // 2 min timeout for cold starts
      setJobId(response.data.jobId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start conversion');
      setLoading(false);
      setStatus(null);
    }
  };

  useEffect(() => {
    let interval;

    if (jobId && status !== 'ready' && status !== 'error') {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(`${API_Base}/status/${jobId}`);
          const data = response.data;

          setStatus(data.status);
          setProgress(data.progress);

          if (data.status === 'ready') {
            setResult(data);
            setLoading(false);
            clearInterval(interval);
          } else if (data.status === 'error') {
            setError(data.error || 'Conversion failed');
            setLoading(false);
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Polling error', err);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [jobId, status]);

  return (
    <div className="app-container">
      <ChaiCup />
      <h1>Chai MP3 Converter</h1>

      {!status && !result && (
        <UrlInput onConvert={handleConvert} isLoading={loading} />
      )}

      {status && status !== 'ready' && status !== 'error' && (
        <ProgressBar progress={progress} status={status} />
      )}

      {result && (
        <DownloadCard result={result} />
      )}

      {error && (
        <div className="card" style={{ borderColor: 'var(--error)' }}>
          <div style={{ color: 'var(--error)', textAlign: 'center' }}>
            ⚠️ {error}
            <button
              onClick={() => { setError(''); setStatus(null); setJobId(null); }}
              style={{ display: 'block', margin: '1rem auto 0', background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
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
