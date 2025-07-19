import React, { useState, useEffect } from 'react';

const API_URL = 'https://clownfish-app-3lhwr.ondigitalocean.app';

function App() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('safelift_token');
    if (token) {
      checkAuth(token);
    }
  }, []);

  const checkAuth = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      localStorage.removeItem('safelift_token');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('safelift_token', data.token);
        setUser(data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('safelift_token');
    setUser(null);
    setEmail('');
    setPassword('');
  };

  // If user is logged in, show dashboard
  if (user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: 'system-ui'
      }}>
        <header style={{
          background: 'white',
          padding: '1rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ color: '#1e293b', margin: 0 }}>SafeLift Suite</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Welcome, {user.firstName}!</span>
            <button 
              onClick={logout}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </header>
        
        <main style={{ padding: '2rem' }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h2>🎉 Authentication System Working!</h2>
            <p>Welcome to SafeLift Suite, {user.firstName} {user.lastName}!</p>
            <div style={{
              background: '#f0fdf4',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '1px solid #86efac',
              marginTop: '1rem'
            }}>
              <h3 style={{ color: '#166534', margin: '0 0 0.5rem 0' }}>✅ Authentication Complete</h3>
              <p style={{ color: '#166534', margin: 0 }}>
                Multi-tenant authentication system is now live and working with your PostgreSQL database!
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Login form
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
      fontFamily: 'system-ui'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        width: '400px',
        maxWidth: '90vw'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1e293b' }}>
          Sign In to SafeLift Suite
        </h2>
        
        {error && (
          <div style={{
            background: '#fecaca',
            color: '#991b1b',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            border: '1px solid #fca5a5'
          }}>
            {error}
          </div>
        )}
        
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            style={{
              width: '100%',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b7280' }}>
          Test the authentication system!
        </p>
      </div>
    </div>
  );
}

export default App;