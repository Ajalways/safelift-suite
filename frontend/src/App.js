import React from 'react';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
      color: 'white',
      fontFamily: 'system-ui'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>SafeLift Suite</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
          Professional Crane Management Platform
        </p>
        <p style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
          🎉 Successfully deployed to Digital Ocean!
        </p>
      </div>
    </div>
  );
}

export default App;