import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="card" style={{ borderColor: 'var(--error)', margin: '2rem auto', maxWidth: '600px' }}>
                    <div style={{ color: 'var(--error)', textAlign: 'center' }}>
                        <h2>⚠️ Something went wrong</h2>
                        <p>The app encountered an unexpected error. Please refresh the page and try again.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="primary-btn"
                            style={{ margin: '1rem auto', display: 'inline-block' }}
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
