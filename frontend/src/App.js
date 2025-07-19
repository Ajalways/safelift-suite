import React, { useState, useEffect } from 'react';

const API_URL = 'https://clownfish-app-3lhwr.ondigitalocean.app';

function App() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration form state
  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [plan, setPlan] = useState('starter');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

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
      } else {
        localStorage.removeItem('safelift_token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
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
      console.error('Login error:', error);
      setError('Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          companyPhone,
          companyAddress,
          plan,
          firstName,
          lastName,
          email: regEmail,
          password: regPassword
        })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('safelift_token', data.token);
        setUser(data.user);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('safelift_token');
    setUser(null);
    setEmail('');
    setPassword('');
    setRegEmail('');
    setRegPassword('');
    setCompanyName('');
    setCompanyPhone('');
    setCompanyAddress('');
    setFirstName('');
    setLastName('');
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
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #FFB800, #E67E00)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}>
              🏗️
            </div>
            <h1 style={{ color: '#1e293b', margin: 0, fontSize: '1.5rem' }}>SafeLift Suite</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>
                {user.firstName} {user.lastName}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {user.company?.name} ({user.role})
              </div>
            </div>
            <button 
              onClick={logout}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontWeight: '500'
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
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ 
                color: '#1e293b', 
                fontSize: '2rem', 
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #1e3a8a, #3730a3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                🎉 Welcome to SafeLift Suite!
              </h2>
              <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
                Your crane management platform is ready to use.
              </p>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid #86efac',
              marginBottom: '2rem'
            }}>
              <h3 style={{ 
                color: '#166534', 
                margin: '0 0 1rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                ✅ Authentication System Complete
              </h3>
              <div style={{ color: '#166534', lineHeight: '1.6' }}>
                <p style={{ margin: '0 0 0.5rem 0' }}>
                  • Multi-tenant authentication working perfectly
                </p>
                <p style={{ margin: '0 0 0.5rem 0' }}>
                  • Company: {user.company?.name} ({user.company?.plan} plan)
                </p>
                <p style={{ margin: '0 0 0.5rem 0' }}>
                  • Role-based access control enabled
                </p>
                <p style={{ margin: '0' }}>
                  • PostgreSQL database connected and synchronized
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #93c5fd'
              }}>
                <h4 style={{ color: '#1e40af', margin: '0 0 0.5rem 0' }}>🏗️ Crane Management</h4>
                <p style={{ color: '#1e40af', margin: 0, fontSize: '0.9rem' }}>
                  Ready to add crane fleet management features
                </p>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #fefce8, #fef3c7)',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #fbbf24'
              }}>
                <h4 style={{ color: '#92400e', margin: '0 0 0.5rem 0' }}>📋 OSHA Inspections</h4>
                <p style={{ color: '#92400e', margin: 0, fontSize: '0.9rem' }}>
                  Ready to add inspection management system
                </p>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #c084fc'
              }}>
                <h4 style={{ color: '#7c2d12', margin: '0 0 0.5rem 0' }}>👥 Job Scheduling</h4>
                <p style={{ color: '#7c2d12', margin: 0, fontSize: '0.9rem' }}>
                  Ready to add job management features
                </p>
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              marginTop: '2rem',
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: '0.5rem'
            }}>
              <p style={{ color: '#6b7280', margin: 0 }}>
                🚀 <strong>SafeLift Suite</strong> is now live with complete authentication!<br/>
                Ready to build crane management features for your customers.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Login/Registration form
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'system-ui',
      background: '#f8fafc'
    }}>
      {/* Left side - Branding */}
      <div style={{
        flex: '1',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #FFB800, #E67E00)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem auto',
            fontSize: '2rem'
          }}>
            🏗️
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '700' }}>
            SafeLift Suite
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, lineHeight: '1.6' }}>
            Professional crane management platform for construction companies and crane operators.
          </p>
          <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.8 }}>
            ✅ OSHA Compliance • 📊 Fleet Management • 📋 Digital Inspections
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '2.5rem',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '420px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p style={{ color: '#6b7280' }}>
              {isLogin ? 'Access your crane management dashboard' : 'Start managing your crane operations'}
            </p>
          </div>
          
          {error && (
            <div style={{
              background: '#fecaca',
              color: '#991b1b',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #fca5a5',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}
          
          {isLogin ? (
            // Login Form
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
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
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
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
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>
              
              <button
                type="submit"
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
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.1s'
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            // Registration Form
            <form onSubmit={handleRegistration}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
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
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
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
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="ABC Crane Services"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="(555) 123-4567"
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
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                    Plan
                  </label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="starter">Starter ($49/mo)</option>
                    <option value="professional">Professional ($99/mo)</option>
                    <option value="enterprise">Enterprise ($199/mo)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                  Address
                </label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="123 Main St, City, State"
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

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="john@company.com"
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
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Choose a secure password"
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
                type="submit"
                disabled={loading || !regEmail || !regPassword || !companyName || !firstName || !lastName}
                style={{
                  width: '100%',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  padding: '0.875rem',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.9rem'
              }}
            >
              {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;