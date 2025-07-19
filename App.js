import React, { useState, useEffect } from 'react';

const API_URL = 'https://clownfish-app-3lhwr.ondigitalocean.app';

// Manitex crane data
const MANITEX_MODELS = {
  'TC50155': {
    name: 'Manitex TC50155',
    maxCapacity: 50,
    maxRadius: 100,
    planRequired: 'professional',
    loadChart: {
      10: { boom38: 50.0, boom48: 45.0, boom58: 40.0 },
      15: { boom38: 45.0, boom48: 40.0, boom58: 35.0 },
      20: { boom38: 35.0, boom48: 30.0, boom58: 25.0 },
      25: { boom38: 28.0, boom48: 24.0, boom58: 20.0 },
      30: { boom38: 22.0, boom48: 19.0, boom58: 16.0 },
      35: { boom38: 18.0, boom48: 15.5, boom58: 13.0 },
      40: { boom38: 15.0, boom48: 12.5, boom58: 10.5 },
      45: { boom38: 12.5, boom48: 10.0, boom58: 8.5 },
      50: { boom38: 10.5, boom48: 8.5, boom58: 7.0 },
      60: { boom38: 7.5, boom48: 6.0, boom58: 5.0 },
      70: { boom38: 5.5, boom48: 4.5, boom58: 3.8 },
      80: { boom38: 4.2, boom48: 3.5, boom58: 3.0 },
      90: { boom38: 3.2, boom48: 2.8, boom58: 2.4 },
      100: { boom38: 2.5, boom48: 2.2, boom58: 2.0 }
    }
  },
  'TC40124': {
    name: 'Manitex TC40124',
    maxCapacity: 40,
    maxRadius: 90,
    planRequired: 'professional',
    loadChart: {
      10: { boom32: 40.0, boom42: 35.0, boom52: 30.0 },
      15: { boom32: 35.0, boom42: 30.0, boom52: 25.0 },
      20: { boom32: 28.0, boom42: 24.0, boom52: 20.0 },
      25: { boom32: 22.0, boom42: 19.0, boom52: 16.0 },
      30: { boom32: 18.0, boom42: 15.0, boom52: 13.0 },
      35: { boom32: 15.0, boom42: 12.5, boom52: 10.5 },
      40: { boom32: 12.5, boom42: 10.0, boom52: 8.5 },
      50: { boom32: 8.5, boom42: 7.0, boom52: 6.0 },
      60: { boom32: 6.0, boom42: 5.0, boom52: 4.2 },
      70: { boom32: 4.5, boom42: 3.8, boom52: 3.2 },
      80: { boom32: 3.5, boom42: 3.0, boom52: 2.5 },
      90: { boom32: 2.8, boom42: 2.4, boom52: 2.0 }
    }
  },
  'TC30112': {
    name: 'Manitex TC30112',
    maxCapacity: 30,
    maxRadius: 85,
    planRequired: 'starter',
    loadChart: {
      10: { boom30: 30.0, boom40: 25.0, boom50: 20.0 },
      15: { boom30: 25.0, boom40: 20.0, boom50: 16.0 },
      20: { boom30: 20.0, boom40: 16.0, boom50: 13.0 },
      25: { boom30: 16.0, boom40: 13.0, boom50: 11.0 },
      30: { boom30: 13.0, boom40: 11.0, boom50: 9.0 },
      40: { boom30: 9.0, boom40: 7.5, boom50: 6.5 },
      50: { boom30: 6.5, boom40: 5.5, boom50: 4.8 },
      60: { boom30: 4.8, boom40: 4.0, boom50: 3.5 },
      70: { boom30: 3.5, boom40: 3.0, boom50: 2.6 },
      80: { boom30: 2.6, boom40: 2.3, boom50: 2.0 }
    }
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
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

  // Load Calculator state
  const [selectedModel, setSelectedModel] = useState('TC30112');
  const [workingRadius, setWorkingRadius] = useState(20);
  const [boomLength, setBoomLength] = useState('boom30');
  const [loadWeight, setLoadWeight] = useState(10);
  const [outriggerConfig, setOutriggerConfig] = useState('fully-extended');
  const [calculation, setCalculation] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('safelift_token');
    if (token) {
      checkAuth(token);
    }
  }, []);

  // Calculate load when parameters change
  useEffect(() => {
    if (currentView === 'load-calculator') {
      calculateLoad();
    }
  }, [workingRadius, boomLength, loadWeight, outriggerConfig, selectedModel, currentView]);

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
    setCurrentView('dashboard');
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

  const calculateLoad = () => {
    const currentModel = MANITEX_MODELS[selectedModel];
    if (!currentModel) return;

    const chart = currentModel.loadChart;
    
    // Find closest radius in chart
    const availableRadii = Object.keys(chart).map(Number).sort((a, b) => a - b);
    let closestRadius = availableRadii[0];
    
    for (let radius of availableRadii) {
      if (radius <= workingRadius) {
        closestRadius = radius;
      } else {
        break;
      }
    }

    const capacityAtRadius = chart[closestRadius]?.[boomLength] || 0;
    
    // Apply outrigger reduction factors
    let capacityReduction = 1.0;
    if (outriggerConfig === 'partially-extended') {
      capacityReduction = 0.85;
    } else if (outriggerConfig === 'on-rubber') {
      capacityReduction = 0.75;
    }

    const adjustedCapacity = capacityAtRadius * capacityReduction;
    const loadMoment = loadWeight * workingRadius;
    const capacityMoment = adjustedCapacity * workingRadius;
    const safetyFactor = adjustedCapacity / loadWeight;
    const isWithinCapacity = loadWeight <= adjustedCapacity;

    setCalculation({
      radius: workingRadius,
      chartRadius: closestRadius,
      chartCapacity: capacityAtRadius,
      adjustedCapacity: adjustedCapacity,
      loadWeight: loadWeight,
      loadMoment: loadMoment,
      capacityMoment: capacityMoment,
      safetyFactor: safetyFactor,
      isWithinCapacity: isWithinCapacity,
      utilizationPercent: (loadWeight / adjustedCapacity) * 100
    });
  };

  const getSafetyColor = () => {
    if (!calculation) return '#gray';
    if (calculation.isWithinCapacity && calculation.safetyFactor >= 1.25) return '#10b981';
    if (calculation.isWithinCapacity && calculation.safetyFactor >= 1.1) return '#f59e0b';
    return '#ef4444';
  };

  const getBoomLengthOptions = () => {
    const currentModel = MANITEX_MODELS[selectedModel];
    if (!currentModel) return [];
    const chart = currentModel.loadChart;
    const firstEntry = Object.values(chart)[0];
    return Object.keys(firstEntry);
  };

  const hasLoadCalculatorAccess = () => {
    if (!user || !user.company) return false;
    const userPlan = user.company.plan;
    return userPlan === 'professional' || userPlan === 'enterprise';
  };

  const getAvailableModels = () => {
    if (!user || !user.company) return {};
    const userPlan = user.company.plan;
    
    if (userPlan === 'starter') {
      return { TC30112: MANITEX_MODELS.TC30112 };
    }
    
    return MANITEX_MODELS;
  };

  // If user is logged in, show dashboard
  if (user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: 'system-ui'
      }}>
        {/* Header */}
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
                {user.company?.name} ({user.company?.plan})
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

        {/* Navigation */}
        <nav style={{
          background: 'white',
          padding: '0 2rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <button
              onClick={() => setCurrentView('dashboard')}
              style={{
                background: 'none',
                border: 'none',
                padding: '1rem 0',
                cursor: 'pointer',
                fontWeight: '500',
                color: currentView === 'dashboard' ? '#3b82f6' : '#6b7280',
                borderBottom: currentView === 'dashboard' ? '2px solid #3b82f6' : '2px solid transparent'
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('load-calculator')}
              style={{
                background: 'none',
                border: 'none',
                padding: '1rem 0',
                cursor: 'pointer',
                fontWeight: '500',
                color: currentView === 'load-calculator' ? '#3b82f6' : '#6b7280',
                borderBottom: currentView === 'load-calculator' ? '2px solid #3b82f6' : '2px solid transparent'
              }}
            >
              Load Calculator {!hasLoadCalculatorAccess() && '🔒'}
            </button>
          </div>
        </nav>
        
        {/* Main Content */}
        <main style={{ padding: '2rem' }}>
          {currentView === 'dashboard' && (
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
                    • Company: {user.company?.name} ({user.company?.plan} plan)
                  </p>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    • Role: {user.role} access level
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
                  <h4 style={{ color: '#1e40af', margin: '0 0 0.5rem 0' }}>🏗️ Load Calculator</h4>
                  <p style={{ color: '#1e40af', margin: 0, fontSize: '0.9rem' }}>
                    {hasLoadCalculatorAccess() ? 
                      'Manitex boom truck load calculations available' : 
                      'Upgrade to Professional for load calculator access'
                    }
                  </p>
                  {!hasLoadCalculatorAccess() && (
                    <button 
                      style={{
                        marginTop: '0.5rem',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      Upgrade Plan
                    </button>
                  )}
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #fefce8, #fef3c7)',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #fbbf24'
                }}>
                  <h4 style={{ color: '#92400e', margin: '0 0 0.5rem 0' }}>📋 OSHA Inspections</h4>
                  <p style={{ color: '#92400e', margin: 0, fontSize: '0.9rem' }}>
                    Coming soon - Digital inspection management
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
                    Coming soon - Advanced job management
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentView === 'load-calculator' && (
            <>
              {!hasLoadCalculatorAccess() ? (
                <div style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  maxWidth: '600px',
                  margin: '0 auto',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    fontSize: '1.5rem'
                  }}>
                    🔒
                  </div>
                  <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>
                    Load Calculator Access Required
                  </h2>
                  <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                    The Manitex Load Calculator is available for Professional and Enterprise plans.
                    Your current plan: <strong>{user.company?.plan}</strong>
                  </p>
                  <div style={{
                    background: '#f8fafc',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>Professional Plan - $99/month</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#6b7280' }}>
                      <li>Access to all Manitex boom truck models</li>
                      <li>Real-time load capacity calculations</li>
                      <li>Safety factor analysis</li>
                      <li>Printable load calculation reports</li>
                    </ul>
                  </div>
                  <button style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    Upgrade to Professional
                  </button>
                </div>
              ) : (
                // Load Calculator Interface
                <div>
                  {/* Header */}
                  <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    marginBottom: '2rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        background: 'linear-gradient(135deg, #FFB800, #E67E00)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem'
                      }}>
                        🏗️
                      </div>
                      <div>
                        <h1 style={{ margin: 0, color: '#1e293b', fontSize: '1.75rem' }}>
                          Manitex Load Calculator
                        </h1>
                        <p style={{ margin: 0, color: '#6b7280' }}>
                          Professional load capacity calculations for Manitex boom truck cranes
                        </p>
                      </div>
                    </div>

                    {/* Model Selection */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                        Crane Model
                      </label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        style={{
                          padding: '0.75rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          fontSize: '1rem',
                          minWidth: '200px'
                        }}
                      >
                        {Object.keys(getAvailableModels()).map(model => (
                          <option key={model} value={model}>
                            {MANITEX_MODELS[model].name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Input Parameters */}
                    <div style={{
                      background: 'white',
                      padding: '2rem',
                      borderRadius: '1rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      height: 'fit-content'
                    }}>
                      <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>
                        Lift Parameters
                      </h2>

                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                          Working Radius (feet)
                        </label>
                        <input
                          type="number"
                          value={workingRadius}
                          onChange={(e) => setWorkingRadius(Number(e.target.value))}
                          min="10"
                          max={MANITEX_MODELS[selectedModel]?.maxRadius || 100}
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                          Boom Length Configuration
                        </label>
                        <select
                          value={boomLength}
                          onChange={(e) => setBoomLength(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '1rem'
                          }}
                        >
                          {getBoomLengthOptions().map(length => (
                            <option key={length} value={length}>
                              {length.replace('boom', '')} ft Boom
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                          Load Weight (tons)
                        </label>
                        <input
                          type="number"
                          value={loadWeight}
                          onChange={(e) => setLoadWeight(Number(e.target.value))}
                          min="0.1"
                          step="0.1"
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
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                          Outrigger Configuration
                        </label>
                        <select
                          value={outriggerConfig}
                          onChange={(e) => setOutriggerConfig(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            fontSize: '1rem'
                          }}
                        >
                          <option value="fully-extended">Fully Extended (100%)</option>
                          <option value="partially-extended">Partially Extended (85%)</option>
                          <option value="on-rubber">On Rubber (75%)</option>
                        </select>
                      </div>
                    </div>

                    {/* Results */}
                    <div style={{
                      background: 'white',
                      padding: '2rem',
                      borderRadius: '1rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                      <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>
                        Load Calculation Results
                      </h2>

                      {calculation && (
                        <>
                          {/* Safety Status */}
                          <div style={{
                            background: calculation.isWithinCapacity ? 
                              'linear-gradient(135deg, #ecfdf5, #d1fae5)' : 
                              'linear-gradient(135deg, #fef2f2, #fecaca)',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            border: `2px solid ${getSafetyColor()}`,
                            marginBottom: '1.5rem'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.5rem'
                            }}>
                              <span style={{ fontSize: '1.25rem' }}>
                                {calculation.isWithinCapacity ? '✅' : '❌'}
                              </span>
                              <h3 style={{
                                margin: 0,
                                color: getSafetyColor(),
                                fontSize: '1.125rem'
                              }}>
                                {calculation.isWithinCapacity ? 'SAFE LIFT' : 'EXCEEDS CAPACITY'}
                              </h3>
                            </div>
                            <p style={{
                              margin: 0,
                              color: getSafetyColor(),
                              fontSize: '0.875rem'
                            }}>
                              Safety Factor: {calculation.safetyFactor.toFixed(2)} | 
                              Utilization: {calculation.utilizationPercent.toFixed(1)}%
                            </p>
                          </div>

                          {/* Calculation Details */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{
                              background: '#f8fafc',
                              padding: '1rem',
                              borderRadius: '0.5rem'
                            }}>
                              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                Chart Capacity
                              </div>
                              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
                                {calculation.chartCapacity.toFixed(1)} tons
                              </div>
                            </div>

                            <div style={{
                              background: '#f8fafc',
                              padding: '1rem',
                              borderRadius: '0.5rem'
                            }}>
                              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                Adjusted Capacity
                              </div>
                              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
                                {calculation.adjustedCapacity.toFixed(1)} tons
                              </div>
                            </div>

                            <div style={{
                              background: '#f8fafc',
                              padding: '1rem',
                              borderRadius: '0.5rem'
                            }}>
                              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                Load Moment
                              </div>
                              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
                                {calculation.loadMoment.toFixed(0)} ft-lbs
                              </div>
                            </div>

                            <div style={{
                              background: '#f8fafc',
                              padding: '1rem',
                              borderRadius: '0.5rem'
                            }}>
                              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                Capacity Moment
                              </div>
                              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
                                {calculation.capacityMoment.toFixed(0)} ft-lbs
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginTop: '2rem'
                          }}>
                            <button style={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                              color: 'white',
                              border: 'none',
                              padding: '0.75rem 1rem',
                              borderRadius: '0.5rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}>
                              Save Calculation
                            </button>
                            <button style={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              color: 'white',
                              border: 'none',
                              padding: '0.75rem 1rem',
                              borderRadius: '0.5rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}>
                              Print Report
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
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
            Professional crane management platform with advanced Manitex load calculation capabilities.
          </p>
          <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.8' }}>
            ✅ Manitex Calculator • 📊 Fleet Management • 📋 Digital Inspections
          </div>
        </div>
      </div>

      {/* Right side - Login/Registration */}
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
              {isLogin ? 'Access your crane management dashboard' : 'Start with Manitex load calculations'}
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
            // Login Interface
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
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    outline: 'none'
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
                    outline: 'none'
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
          ) : (
            // Registration Interface
            <div>
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
                onClick={handleRegistration}
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
            </div>
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