import React from 'react';

const ProtectedPage = ({ user, children, fallback = null, onNavigate = () => {} }) => {
  if (!user) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        color: '#666',
        padding: '2rem'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
        <h2 style={{ marginBottom: '0.5rem', color: '#333' }}>Sign in required</h2>
        <p style={{ marginBottom: '1.5rem', color: '#999' }}>Please sign in to access this page</p>
        <button
          onClick={() => onNavigate('login')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600'
          }}
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedPage;
