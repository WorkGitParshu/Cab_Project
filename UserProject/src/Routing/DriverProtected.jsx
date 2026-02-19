import React from 'react';

const DriverProtected = ({ cab, children, onNavigate = () => {} }) => {
  if (!cab) {
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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚗</div>
        <h2 style={{ marginBottom: '0.5rem', color: '#333' }}>Driver login required</h2>
        <p style={{ marginBottom: '1.5rem', color: '#999' }}>Please sign in as a driver to access this page</p>
        <button
          onClick={() => onNavigate('cab-login')}
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
          Go to Driver Login
        </button>
      </div>
    );
  }

  return children;
};

export default DriverProtected;
