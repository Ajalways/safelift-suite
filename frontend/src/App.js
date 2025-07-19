import React, { useState, useEffect } from 'react';

const API_URL = 'https://clownfish-app-3lhwr.ondigitalocean.app';

function App() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Registration form state
  const [regForm, setRegForm] = useState({
    companyName: '',
    companyPhone: '',
    companyAddress: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    plan: 'starter'
  });

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('safelift_token');
    if (token) {
      checkAuth(token);
    }
  }, []);

  const checkAuth = async (token) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
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
      const response = await fetch(`${API_URL}/auth/login`, {
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm)
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('safelift_token', data.token);
        setUser(data.user);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
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
  };

  const updateRegForm = (field, value) => {
    setRegForm(prev => ({ ...prev, [field]: value }));
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
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#1e293b', margin: 0, fontSize: '1.5rem' }}>SafeLift Suite</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>
                {user.firstName} {user.lastName}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {user.role} • {user.email}
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
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>
              🎉 Welcome to SafeLift Suite!
            </h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              Your authentication system is working perfectly. You're successfully logged in!
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: '#f0fdf4',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #86efac'
              }}>
                <h3 style={{ color: '#166534', margin: '0 0 0.5rem 0' }}>✅ Authentication</h3>
                <p style={{ color: '#166534', margin: 0, fontSize: '0.9rem' }}>
                  Multi-tenant login system working
                </p>
              </div>
              
              <div style={{
                background: '#eff6ff',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #93c5fd'
              }}>
                <h3 style={{ color: '#1e40af', margin: '0 0 0.5rem 0' }}>🔐 Security</h3>
                <p style={{ color: '#1e40af', margin: 0, fontSize: '0.9rem' }}>
                  JWT tokens & password encryption
                </p>
              </div>
              
              <div style={{
                background: '#fdf4ff',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #d8b4fe'
              }}>
                <h3 style={{ color: '#7c3aed', margin: '0 0 0.5rem 0' }}>🏢 Multi-tenant</h3>
                <p style={{ color: '#7c3aed', margin: 0, fontSize: '0.9rem' }}>
                  Company data separation ready
                </p>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #f59e0b'
            }}>
              <h3 style={{ color: '#92400e', margin: '0 0 1rem 0' }}>🚀 Ready for Next Phase</h3>
              <p style={{ color: '#92400e', margin: '0 0 1rem 0' }}>
                Authentication system complete! Ready to add:
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.5rem',
                fontSize: '0.9rem',
                color: '#92400e'
              }}>
                <div>🏗️ Crane fleet management</div>
                <div>📋 OSHA inspection system</div>
                <div>📅 Job scheduling</div>
                <div>👷 Operator management</div>
                <div>🔧 Maintenance tracking</div>
                <div>📊 Incident reporting</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Authentication forms
  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: 'system-ui'
    }}>
      {/* Left side - Branding */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
        padding: '4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>🏗️</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            margin: '0 0 0.5rem 0',
            background: 'linear-gradient(135deg, #FFB800, #E67E00)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            SafeLift Suite
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, margin: 0 }}>
            Professional Crane Management Platform
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🏗️</span>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0' }}>Fleet Management</h3>
              <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.8 }}>
                Track and manage your entire crane fleet
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0' }}>OSHA Compliance</h3>
              <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.8 }}>
                Digital inspections and safety docs
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📅</span>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0' }}>Job Scheduling</h3>
              <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.8 }}>
                Efficient scheduling with conflict detection
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Forms */}
      <div style={{
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '500px',
          background: 'white',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '2.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.5rem 0' }}>
              {isLogin ? 'Sign In to SafeLift Suite' : 'Create Your Account'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
              {isLogin ? 'Enter your credentials to access your dashboard' : 'Get started with your crane management platform'}
            </p>
          </div>

          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #fecaca, #f87171)',
              color: '#991b1b',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              border: '1px solid #fca5a5'
            }}>
              <span>⚠️</span>
              {error}
            </div>
          )}

          {isLogin ? (
            // Login Form
            <div>
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
                    padding: '0.75rem 1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease'
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
                    padding: '0.75rem 1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease'
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
                  padding: '0.875rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          ) : (
            // Registration Form
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#1e293b' }}>Company Information</h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={regForm.companyName}
                    onChange={(e) => updateRegForm('companyName', e.target.value)}
                    placeholder="ABC Crane Services"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={regForm.companyPhone}
                      onChange={(e) => updateRegForm('companyPhone', e.target.value)}
                      placeholder="(555) 123-4567"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                      Plan
                    </label>
                    <select
                      value={regForm.plan}
                      onChange={(e) => updateRegForm('plan', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '0.95rem'
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
                    Address *
                  </label>
                  <input
                    type="text"
                    value={regForm.companyAddress}
                    onChange={(e) => updateRegForm('companyAddress', e.target.value)}
                    placeholder="123 Industrial Blvd"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#1e293b' }}>Admin User</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={regForm.firstName}
                      onChange={(e) => updateRegForm('firstName', e.target.value)}
                      placeholder="John"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={regForm.lastName}
                      onChange={(e) => updateRegForm('lastName', e.target.value)}
                      placeholder="Smith"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={regForm.email}
                    onChange={(e) => updateRegForm('email', e.target.value)}
                    placeholder="john@abccranes.com"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    value={regForm.password}
                    onChange={(e) => updateRegForm('password', e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>
              
              <button
                onClick={handleRegister}
                disabled={loading || !regForm.companyName || !regForm.firstName || !regForm.email || !regForm.password}
                style={{
                  width: '100%',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          )}

          <div style={{
            textAlign: 'center',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline'
              }}
            >
              {isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;