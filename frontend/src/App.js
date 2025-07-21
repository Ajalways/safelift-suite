import React, { useState, useEffect } from 'react';

const API_URL = 'https://clownfish-app-3lhwr.ondigitalocean.app';

// Sample data for immediate functionality
const SAMPLE_CRANES = [
  { 
    id: 1, make: 'Manitex', model: 'TC50155', year: 2020, capacity: 50, status: 'Available', 
    lastInspection: '2025-01-15', location: 'Main Yard', serialNumber: 'MX2020-001',
    hasLoadChart: true, loadChartFile: 'manitex-tc50155-chart.pdf',
    configFields: ['boomLength', 'counterweight', 'outriggers'],
    configOptions: {
      boomLength: ['38ft', '48ft', '58ft'],
      counterweight: ['Standard', 'Heavy'],
      outriggers: ['Fully Extended', 'Partially Extended', 'On Rubber']
    }
  },
  { 
    id: 2, make: 'Grove', model: 'RT890E', year: 2019, capacity: 90, status: 'In Use', 
    lastInspection: '2025-01-10', location: 'Downtown Site', serialNumber: 'GR2019-045',
    hasLoadChart: true, loadChartFile: 'grove-rt890e-chart.pdf',
    configFields: ['boomLength', 'jibLength', 'outriggers'],
    configOptions: {
      boomLength: ['42ft', '52ft', '62ft'],
      jibLength: ['None', '17ft', '34ft'],
      outriggers: ['Fully Extended', 'Partially Extended', 'On Rubber']
    }
  },
  { 
    id: 3, make: 'Liebherr', model: 'LTM 1200-5.1', year: 2021, capacity: 200, status: 'Maintenance', 
    lastInspection: '2025-01-05', location: 'Service Center', serialNumber: 'LB2021-123',
    hasLoadChart: false, loadChartFile: null,
    configFields: [],
    configOptions: {}
  }
];

const SAMPLE_OPERATORS = [
  { 
    id: 1, name: 'John Smith', email: 'john@company.com', phone: '555-0101', status: 'Available',
    emergencyContact: 'Jane Smith', emergencyPhone: '555-0201',
    certifications: [
      { type: 'NCCCO Mobile Crane', number: 'MC-123456', expires: '2026-01-15', status: 'Active' },
      { type: 'OSHA 30-Hour', number: 'OS-789012', expires: '2025-12-01', status: 'Active' }
    ]
  },
  { 
    id: 2, name: 'Mike Johnson', email: 'mike@company.com', phone: '555-0102', status: 'On Job',
    emergencyContact: 'Sarah Johnson', emergencyPhone: '555-0202',
    certifications: [
      { type: 'NCCCO Tower Crane', number: 'TC-456789', expires: '2025-08-15', status: 'Expiring Soon' }
    ]
  }
];

const SAMPLE_JOBS = [
  { 
    id: 1, title: 'Downtown Office Building', customer: 'ABC Construction', crane: 'Grove RT890E', 
    operator: 'Mike Johnson', date: '2025-07-20', status: 'In Progress', duration: '8 hours', 
    rate: '$150/hour', notes: 'High-rise construction project'
  },
  { 
    id: 2, title: 'Warehouse Construction', customer: 'XYZ Builders', crane: 'Manitex TC50155', 
    operator: 'John Smith', date: '2025-07-22', status: 'Scheduled', duration: '6 hours', 
    rate: '$125/hour', notes: 'Industrial warehouse lifting'
  }
];

const SAMPLE_INSPECTIONS = [
  {
    id: 1, craneId: 1, craneName: 'Manitex TC50155', date: '2025-01-15', inspector: 'John Smith',
    status: 'Passed', score: 95, items: [
      { category: 'General', item: 'Visual inspection', status: 'Pass', notes: 'Good condition' },
      { category: 'Engine', item: 'Engine operation', status: 'Pass', notes: 'Running smoothly' },
      { category: 'Boom', item: 'Boom extension', status: 'Pass', notes: 'No issues' },
      { category: 'Safety', item: 'Load moment indicator', status: 'Fail', notes: 'Needs calibration' }
    ]
  }
];

const INSPECTION_CATEGORIES = [
  { id: 'general', name: 'General Condition', items: ['Visual inspection of crane', 'Check for damage/wear', 'Fluid leaks', 'Rust/corrosion'] },
  { id: 'engine', name: 'Engine/Hydraulics', items: ['Engine operation', 'Hydraulic fluid level', 'Hose condition', 'Filter condition'] },
  { id: 'boom', name: 'Boom/Jib', items: ['Boom extension/retraction', 'Boom angle indicator', 'Jib operation', 'Load block'] },
  { id: 'outriggers', name: 'Outriggers', items: ['Outrigger extension', 'Float condition', 'Retraction operation', 'Position indicators'] },
  { id: 'safety', name: 'Safety Systems', items: ['Load moment indicator', 'Warning systems', 'Emergency stops', 'Load charts present'] }
];

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Data states
  const [cranes, setCranes] = useState(SAMPLE_CRANES);
  const [operators, setOperators] = useState(SAMPLE_OPERATORS);
  const [jobs, setJobs] = useState(SAMPLE_JOBS);
  const [inspections, setInspections] = useState(SAMPLE_INSPECTIONS);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Auth form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [plan, setPlan] = useState('starter');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Form states
  const [craneForm, setCraneForm] = useState({
    make: '', model: '', year: '', capacity: '', serialNumber: '', location: '', status: 'Available',
    hasLoadChart: false, loadChartFile: null, configFields: [], configOptions: {}
  });
  const [operatorForm, setOperatorForm] = useState({
    name: '', email: '', phone: '', emergencyContact: '', emergencyPhone: '', status: 'Available'
  });
  const [jobForm, setJobForm] = useState({
    title: '', customer: '', crane: '', operator: '', date: '', duration: '', rate: '', notes: ''
  });

  // Load Calculator states
  const [selectedCrane, setSelectedCrane] = useState(null);
  const [loadWeight, setLoadWeight] = useState(10);
  const [workingRadius, setWorkingRadius] = useState(20);
  const [craneConfig, setCraneConfig] = useState({});
  const [calculationResult, setCalculationResult] = useState(null);

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
      localStorage.removeItem('safelift_token');
    }
  };

  const handleLogin = async () => {
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

  const handleRegistration = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName, companyPhone, companyAddress, plan,
          firstName, lastName, email: regEmail, password: regPassword
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
      setError('Registration failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('safelift_token');
    setUser(null);
    setCurrentView('dashboard');
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
    
    if (type === 'crane') {
      setCraneForm(item || { 
        make: '', model: '', year: '', capacity: '', serialNumber: '', location: '', status: 'Available',
        hasLoadChart: false, loadChartFile: null, configFields: [], configOptions: {}
      });
    } else if (type === 'operator') {
      setOperatorForm(item || { name: '', email: '', phone: '', emergencyContact: '', emergencyPhone: '', status: 'Available' });
    } else if (type === 'job') {
      setJobForm(item || { title: '', customer: '', crane: '', operator: '', date: '', duration: '', rate: '', notes: '' });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedItem(null);
  };

  const saveCrane = () => {
    if (selectedItem) {
      setCranes(cranes.map(crane => crane.id === selectedItem.id ? { ...craneForm, id: selectedItem.id } : crane));
    } else {
      setCranes([...cranes, { ...craneForm, id: Date.now(), lastInspection: 'Not inspected' }]);
    }
    closeModal();
  };

  const saveOperator = () => {
    if (selectedItem) {
      setOperators(operators.map(op => op.id === selectedItem.id ? { ...operatorForm, id: selectedItem.id, certifications: selectedItem.certifications } : op));
    } else {
      setOperators([...operators, { ...operatorForm, id: Date.now(), certifications: [] }]);
    }
    closeModal();
  };

  const saveJob = () => {
    if (selectedItem) {
      setJobs(jobs.map(job => job.id === selectedItem.id ? { ...jobForm, id: selectedItem.id } : job));
    } else {
      setJobs([...jobs, { ...jobForm, id: Date.now(), status: 'Scheduled' }]);
    }
    closeModal();
  };

  const deleteCrane = (id) => {
    setCranes(cranes.filter(crane => crane.id !== id));
  };

  const deleteOperator = (id) => {
    setOperators(operators.filter(op => op.id !== id));
  };

  const deleteJob = (id) => {
    setJobs(jobs.filter(job => job.id !== id));
  };

  const getStatusColor = (status) => {
    const colors = {
      'Available': '#10b981', 'In Use': '#f59e0b', 'Maintenance': '#ef4444', 'Out of Service': '#6b7280',
      'Active': '#10b981', 'Expiring Soon': '#f59e0b', 'Expired': '#ef4444',
      'Scheduled': '#3b82f6', 'In Progress': '#f59e0b', 'Completed': '#10b981', 'Passed': '#10b981', 'Failed': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  // Load Calculator Functions
  const handleCraneSelection = (craneId) => {
    const crane = cranes.find(c => c.id === parseInt(craneId));
    setSelectedCrane(crane);
    setCraneConfig({});
    setCalculationResult(null);
  };

  const handleConfigChange = (field, value) => {
    setCraneConfig({ ...craneConfig, [field]: value });
  };

  const calculateLoad = () => {
    if (!selectedCrane || !selectedCrane.hasLoadChart) {
      setCalculationResult({
        status: 'error',
        message: 'Load chart required for calculations'
      });
      return;
    }

    // Basic calculation logic - in real app this would reference actual load chart data
    const maxCapacity = selectedCrane.capacity;
    const utilizationPercent = (loadWeight / maxCapacity) * 100;
    const safetyFactor = maxCapacity / loadWeight;
    const isWithinCapacity = loadWeight <= maxCapacity;

    setCalculationResult({
      status: isWithinCapacity ? 'safe' : 'danger',
      maxCapacity,
      loadWeight,
      utilizationPercent,
      safetyFactor,
      workingRadius,
      configuration: craneConfig,
      message: isWithinCapacity ? 'Load is within safe limits' : 'Load exceeds crane capacity'
    });
  };

  const addConfigField = () => {
    const newField = prompt('Enter configuration field name (e.g., Boom Length, Counterweight):');
    if (newField && !craneForm.configFields.includes(newField)) {
      setCraneForm({
        ...craneForm,
        configFields: [...craneForm.configFields, newField],
        configOptions: { ...craneForm.configOptions, [newField]: [] }
      });
    }
  };

  const addConfigOption = (field) => {
    const newOption = prompt(`Add option for ${field}:`);
    if (newOption) {
      setCraneForm({
        ...craneForm,
        configOptions: {
          ...craneForm.configOptions,
          [field]: [...(craneForm.configOptions[field] || []), newOption]
        }
      });
    }
  };

  if (user) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui' }}>
        <header style={{
          background: 'white', padding: '1rem 2rem', borderBottom: '1px solid #e5e7eb',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px', height: '40px', background: 'linear-gradient(135deg, #FFB800, #E67E00)',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 'bold', fontSize: '1.2rem'
            }}>🏗️</div>
            <h1 style={{ color: '#1e293b', margin: 0, fontSize: '1.5rem' }}>SafeLift Suite</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>{user.firstName} {user.lastName}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user.company?.name} ({user.company?.plan})</div>
            </div>
            <button onClick={logout} style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none',
              padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '500'
            }}>Logout</button>
          </div>
        </header>

        <nav style={{ background: 'white', padding: '0 2rem', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {['dashboard', 'cranes', 'operators', 'jobs', 'inspections', 'load-calculator'].map(view => (
              <button key={view} onClick={() => setCurrentView(view)} style={{
                background: 'none', border: 'none', padding: '1rem 0', cursor: 'pointer',
                fontWeight: '500', textTransform: 'capitalize',
                color: currentView === view ? '#3b82f6' : '#6b7280',
                borderBottom: currentView === view ? '2px solid #3b82f6' : '2px solid transparent'
              }}>
                {view === 'load-calculator' ? 'Load Calculator' : view}
              </button>
            ))}
          </div>
        </nav>

        <main style={{ padding: '2rem' }}>
          {currentView === 'dashboard' && (
            <div style={{ display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {[
                  { icon: '🏗️', value: cranes.length, label: 'Total Cranes' },
                  { icon: '📊', value: cranes.filter(c => c.hasLoadChart).length, label: 'Cranes with Load Charts' },
                  { icon: '👥', value: operators.length, label: 'Operators' },
                  { icon: '📋', value: jobs.length, label: 'Active Jobs' }
                ].map((stat, idx) => (
                  <div key={idx} style={{
                    background: 'white', padding: '1.5rem', borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '1rem'
                  }}>
                    <div style={{ fontSize: '2rem' }}>{stat.icon}</div>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>{stat.value}</div>
                      <div style={{ color: '#6b7280' }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <h2 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Getting Started with Load Calculator</h2>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: '0.5rem', border: '1px solid #0ea5e9' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#0369a1' }}>Step 1: Add Your Cranes</h3>
                    <p style={{ margin: '0', color: '#0c4a6e' }}>Upload your crane specifications and load charts for accurate calculations.</p>
                  </div>
                  <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #22c55e' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#15803d' }}>Step 2: Configure Load Charts</h3>
                    <p style={{ margin: '0', color: '#14532d' }}>Map the configuration fields (boom length, counterweight, etc.) for each crane.</p>
                  </div>
                  <div style={{ padding: '1rem', background: '#fefce8', borderRadius: '0.5rem', border: '1px solid #eab308' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#a16207' }}>Step 3: Start Calculating</h3>
                    <p style={{ margin: '0', color: '#713f12' }}>Use the Load Calculator to verify lift capacities and ensure safe operations.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'cranes' && (
            <div style={{ display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, color: '#1e293b' }}>Crane Fleet Management</h1>
                <button onClick={() => openModal('crane')} style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none',
                  padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600'
                }}>Add New Crane</button>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {cranes.map(crane => (
                  <div key={crane.id} style={{
                    background: 'white', padding: '1.5rem', borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', display: 'grid',
                    gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', gap: '1rem'
                  }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{crane.make} {crane.model}</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', color: '#6b7280' }}>
                        <div>Year: {crane.year}</div>
                        <div>Capacity: {crane.capacity} tons</div>
                        <div>Location: {crane.location}</div>
                        <div>Serial: {crane.serialNumber}</div>
                      </div>
                      {crane.hasLoadChart && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                          <span style={{ color: '#10b981', fontWeight: '500' }}>✓ Load Chart Available</span>
                          {crane.configFields.length > 0 && (
                            <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                              Config Fields: {crane.configFields.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{
                      padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500',
                      background: `${getStatusColor(crane.status)}20`, color: getStatusColor(crane.status)
                    }}>{crane.status}</div>
                    <div style={{
                      padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500',
                      background: crane.hasLoadChart ? '#10b98120' : '#ef444420',
                      color: crane.hasLoadChart ? '#10b981' : '#ef4444'
                    }}>
                      {crane.hasLoadChart ? 'Chart Ready' : 'No Chart'}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openModal('crane', crane)} style={{
                        background: '#3b82f6', color: 'white', border: 'none',
                        padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer'
                      }}>Edit</button>
                      <button onClick={() => deleteCrane(crane.id)} style={{
                        background: '#ef4444', color: 'white', border: 'none',
                        padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer'
                      }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'operators' && (
            <div style={{ display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, color: '#1e293b' }}>Operator Management</h1>
                <button onClick={() => openModal('operator')} style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none',
                  padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600'
                }}>Add New Operator</button>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {operators.map(operator => (
                  <div key={operator.id} style={{
                    background: 'white', padding: '1.5rem', borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: '1rem' }}>
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{operator.name}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', color: '#6b7280' }}>
                          <div>Email: {operator.email}</div>
                          <div>Phone: {operator.phone}</div>
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                          <strong>Certifications:</strong>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                            {operator.certifications.map((cert, idx) => (
                              <span key={idx} style={{
                                padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem',
                                background: `${getStatusColor(cert.status)}20`, color: getStatusColor(cert.status)
                              }}>
                                {cert.type} (Exp: {cert.expires})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500',
                        background: `${getStatusColor(operator.status)}20`, color: getStatusColor(operator.status)
                      }}>{operator.status}</div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => openModal('operator', operator)} style={{
                          background: '#3b82f6', color: 'white', border: 'none',
                          padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer'
                        }}>Edit</button>
                        <button onClick={() => deleteOperator(operator.id)} style={{
                          background: '#ef4444', color: 'white', border: 'none',
                          padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer'
                        }}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'jobs' && (
            <div style={{ display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, color: '#1e293b' }}>Job Management</h1>
                <button onClick={() => openModal('job')} style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none',
                  padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600'
                }}>Schedule New Job</button>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {jobs.map(job => (
                  <div key={job.id} style={{
                    background: 'white', padding: '1.5rem', borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', display: 'grid',
                    gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: '1rem'
                  }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{job.title}</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', color: '#6b7280' }}>
                        <div>Customer: {job.customer}</div>
                        <div>Crane: {job.crane}</div>
                        <div>Operator: {job.operator}</div>
                        <div>Date: {job.date}</div>
                        <div>Duration: {job.duration}</div>
                        <div>Rate: {job.rate}</div>
                      </div>
                    </div>
                    <div style={{
                      padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500',
                      background: `${getStatusColor(job.status)}20`, color: getStatusColor(job.status)
                    }}>{job.status}</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openModal('job', job)} style={{
                        background: '#3b82f6', color: 'white', border: 'none',
                        padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer'
                      }}>Edit</button>
                      <button onClick={() => deleteJob(job.id)} style={{
                        background: '#ef4444', color: 'white', border: 'none',
                        padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer'
                      }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'inspections' && (
            <div style={{ display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, color: '#1e293b' }}>OSHA Inspections</h1>
                <button style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none',
                  padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600'
                }}>Start New Inspection</button>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {inspections.map(inspection => (
                  <div key={inspection.id} style={{
                    background: 'white', padding: '1.5rem', borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e293b' }}>{inspection.craneName}</h3>
                        <div style={{ color: '#6b7280' }}>Inspector: {inspection.inspector} | Date: {inspection.date}</div>
                      </div>
                      <div style={{
                        padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500',
                        background: `${getStatusColor(inspection.status)}20`, color: getStatusColor(inspection.status)
                      }}>
                        {inspection.status} ({inspection.score}%)
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.5rem' }}>
                      {inspection.items.slice(0, 4).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                          <span>{item.category}: {item.item}</span>
                          <span style={{ color: getStatusColor(item.status) }}>{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <h2 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Inspection Categories</h2>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {INSPECTION_CATEGORIES.map(category => (
                    <div key={category.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{category.name}</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.25rem' }}>
                        {category.items.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '0.875rem', color: '#6b7280' }}>• {item}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentView === 'load-calculator' && (
            <div style={{ display: 'grid', gap: '2rem' }}>
              <div style={{
                background: 'white', padding: '2rem', borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '50px', height: '50px', background: 'linear-gradient(135deg, #FFB800, #E67E00)',
                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                  }}>🏗️</div>
                  <div>
                    <h1 style={{ margin: 0, color: '#1e293b', fontSize: '1.75rem' }}>Load Calculator</h1>
                    <p style={{ margin: 0, color: '#6b7280' }}>Calculate lift capacities using your crane specifications and load charts</p>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Select Crane</label>
                  <select 
                    value={selectedCrane?.id || ''} 
                    onChange={(e) => handleCraneSelection(e.target.value)}
                    style={{
                      padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem', minWidth: '300px'
                    }}
                  >
                    <option value="">Choose a crane...</option>
                    {cranes.map(crane => (
                      <option key={crane.id} value={crane.id}>
                        {crane.make} {crane.model} - {crane.capacity} tons
                        {!crane.hasLoadChart ? ' (No Load Chart)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedCrane && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div style={{
                    background: 'white', padding: '2rem', borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>Lift Parameters</h2>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Load Weight (tons)</label>
                      <input 
                        type="number"
                        value={loadWeight}
                        onChange={(e) => setLoadWeight(Number(e.target.value))}
                        min="0.1"
                        step="0.1"
                        style={{
                          width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem'
                        }} 
                      />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Working Radius (feet)</label>
                      <input 
                        type="number"
                        value={workingRadius}
                        onChange={(e) => setWorkingRadius(Number(e.target.value))}
                        min="1"
                        style={{
                          width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem'
                        }} 
                      />
                    </div>

                    {selectedCrane.configFields.map(field => (
                      <div key={field} style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>{field}</label>
                        <select 
                          value={craneConfig[field] || ''}
                          onChange={(e) => handleConfigChange(field, e.target.value)}
                          style={{
                            width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem'
                          }}
                        >
                          <option value="">Select {field}...</option>
                          {(selectedCrane.configOptions[field] || []).map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    ))}

                    <button 
                      onClick={calculateLoad}
                      disabled={!selectedCrane.hasLoadChart}
                      style={{
                        width: '100%', 
                        background: selectedCrane.hasLoadChart ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : '#9ca3af',
                        color: 'white', border: 'none', padding: '0.875rem', borderRadius: '0.5rem',
                        fontSize: '1rem', fontWeight: '600', cursor: selectedCrane.hasLoadChart ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {selectedCrane.hasLoadChart ? 'Calculate Load' : 'Load Chart Required'}
                    </button>
                  </div>

                  <div style={{
                    background: 'white', padding: '2rem', borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>Calculation Results</h2>

                    {!selectedCrane.hasLoadChart ? (
                      <div style={{
                        background: '#fef2f2', padding: '1rem', borderRadius: '0.75rem', border: '2px solid #ef4444', marginBottom: '1.5rem'
                      }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#ef4444' }}>❌ Load Chart Required</h3>
                        <p style={{ margin: 0, color: '#991b1b' }}>
                          Upload a load chart for this crane to enable capacity calculations.
                        </p>
                      </div>
                    ) : calculationResult ? (
                      <div>
                        <div style={{
                          background: calculationResult.status === 'safe' ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)' : 'linear-gradient(135deg, #fef2f2, #fecaca)',
                          padding: '1rem', borderRadius: '0.75rem', 
                          border: `2px solid ${calculationResult.status === 'safe' ? '#10b981' : '#ef4444'}`, 
                          marginBottom: '1.5rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>{calculationResult.status === 'safe' ? '✅' : '❌'}</span>
                            <h3 style={{ margin: 0, color: calculationResult.status === 'safe' ? '#10b981' : '#ef4444', fontSize: '1.125rem' }}>
                              {calculationResult.status === 'safe' ? 'SAFE LIFT' : 'EXCEEDS CAPACITY'}
                            </h3>
                          </div>
                          <p style={{ margin: 0, color: calculationResult.status === 'safe' ? '#059669' : '#dc2626', fontSize: '0.875rem' }}>
                            {calculationResult.message}
                          </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Max Capacity</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>{calculationResult.maxCapacity} tons</div>
                          </div>
                          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Safety Factor</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>{calculationResult.safetyFactor.toFixed(2)}</div>
                          </div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Utilization</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>{calculationResult.utilizationPercent.toFixed(1)}%</div>
                        </div>

                        {selectedCrane.loadChartFile && (
                          <div style={{ marginBottom: '1rem' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>Load Chart Reference</h4>
                            <button style={{
                              background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db',
                              padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem'
                            }}>
                              📄 View {selectedCrane.loadChartFile}
                            </button>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <button style={{
                            flex: 1, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', border: 'none',
                            padding: '0.75rem 1rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer'
                          }}>Save Calculation</button>
                          <button style={{
                            flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none',
                            padding: '0.75rem 1rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer'
                          }}>Print Report</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        background: '#f8fafc', padding: '2rem', borderRadius: '0.75rem', textAlign: 'center', color: '#6b7280'
                      }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏗️</div>
                        <p>Enter lift parameters and click Calculate Load to see results</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{
              background: 'white', borderRadius: '1rem', padding: '2rem',
              maxWidth: '600px', width: '90vw', maxHeight: '80vh', overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: '#1e293b', textTransform: 'capitalize' }}>
                  {selectedItem ? 'Edit' : 'Add'} {modalType}
                </h2>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>

              {modalType === 'crane' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {[
                    { label: 'Make', field: 'make' }, { label: 'Model', field: 'model' },
                    { label: 'Year', field: 'year' }, { label: 'Capacity (tons)', field: 'capacity' },
                    { label: 'Serial Number', field: 'serialNumber' }, { label: 'Location', field: 'location' }
                  ].map(item => (
                    <div key={item.field}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{item.label}</label>
                      <input value={craneForm[item.field]} onChange={(e) => setCraneForm({...craneForm, [item.field]: e.target.value})}
                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem' }} />
                    </div>
                  ))}
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Status</label>
                    <select value={craneForm.status} onChange={(e) => setCraneForm({...craneForm, status: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem' }}>
                      {['Available', 'In Use', 'Maintenance', 'Out of Service'].map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0 }}>Load Chart Configuration</h3>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input 
                          type="checkbox" 
                          checked={craneForm.hasLoadChart}
                          onChange={(e) => setCraneForm({...craneForm, hasLoadChart: e.target.checked})}
                        />
                        Has Load Chart
                      </label>
                    </div>

                    {craneForm.hasLoadChart && (
                      <div>
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Load Chart File</label>
                          <input 
                            type="file" 
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => setCraneForm({...craneForm, loadChartFile: e.target.files[0]?.name || null})}
                            style={{ width: '100%', padding: '0.5rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem' }} 
                          />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ fontWeight: '500' }}>Configuration Fields</label>
                            <button 
                              type="button"
                              onClick={addConfigField}
                              style={{
                                background: '#3b82f6', color: 'white', border: 'none',
                                padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem'
                              }}
                            >
                              Add Field
                            </button>
                          </div>
                          
                          {craneForm.configFields.map(field => (
                            <div key={field} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '0.25rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '500' }}>{field}</span>
                                <button 
                                  type="button"
                                  onClick={() => addConfigOption(field)}
                                  style={{
                                    background: '#10b981', color: 'white', border: 'none',
                                    padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem'
                                  }}
                                >
                                  Add Option
                                </button>
                              </div>
                              <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#6b7280' }}>
                                Options: {(craneForm.configOptions[field] || []).join(', ') || 'None'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button onClick={saveCrane} style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none',
                    padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600'
                  }}>Save Crane</button>
                </div>
              )}

              {modalType === 'operator' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {[
                    { label: 'Full Name', field: 'name' }, { label: 'Email', field: 'email' },
                    { label: 'Phone', field: 'phone' }, { label: 'Emergency Contact', field: 'emergencyContact' },
                    { label: 'Emergency Phone', field: 'emergencyPhone' }
                  ].map(item => (
                    <div key={item.field}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{item.label}</label>
                      <input value={operatorForm[item.field]} onChange={(e) => setOperatorForm({...operatorForm, [item.field]: e.target.value})}
                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem' }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Status</label>
                    <select value={operatorForm.status} onChange={(e) => setOperatorForm({...operatorForm, status: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem' }}>
                      {['Available', 'On Job', 'Off Duty', 'Training'].map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={saveOperator} style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none',
                    padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600'
                  }}>Save Operator</button>
                </div>
              )}

              {modalType === 'job' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {[
                    { label: 'Job Title', field: 'title' }, { label: 'Customer', field: 'customer' },
                    { label: 'Date', field: 'date', type: 'date' }, { label: 'Duration', field: 'duration' },
                    { label: 'Rate', field: 'rate' }, { label: 'Notes', field: 'notes' }
                  ].map(item => (
                    <div key={item.field}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{item.label}</label>
                      <input type={item.type || 'text'} value={jobForm[item.field]} 
                        onChange={(e) => setJobForm({...jobForm, [item.field]: e.target.value})}
                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem' }} />
                    </div>
                  ))}
                  {[
                    { label: 'Crane', field: 'crane', options: cranes.filter(c => c.status === 'Available').map(c => `${c.make} ${c.model}`) },
                    { label: 'Operator', field: 'operator', options: operators.filter(o => o.status === 'Available').map(o => o.name) }
                  ].map(item => (
                    <div key={item.field}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{item.label}</label>
                      <select value={jobForm[item.field]} onChange={(e) => setJobForm({...jobForm, [item.field]: e.target.value})}
                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem' }}>
                        <option value="">Select {item.label}</option>
                        {item.options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <button onClick={saveJob} style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none',
                    padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600'
                  }}>Save Job</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui', background: '#f8fafc' }}>
      <div style={{
        flex: '1', background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: 'white'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{
            width: '80px', height: '80px', background: 'linear-gradient(135deg, #FFB800, #E67E00)',
            borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem auto', fontSize: '2rem'
          }}>🏗️</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '700' }}>SafeLift Suite</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, lineHeight: '1.6' }}>
            Complete crane management platform with fleet tracking, job scheduling, OSHA inspections, and custom load calculations.
          </p>
          <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.8' }}>
            ✅ Fleet Management • 📋 OSHA Inspections • 🏗️ Custom Load Calculator
          </div>
        </div>
      </div>

      <div style={{
        flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
      }}>
        <div style={{
          background: 'white', padding: '2.5rem', borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '420px'
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
              background: '#fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem',
              marginBottom: '1rem', border: '1px solid #fca5a5', fontSize: '0.9rem'
            }}>{error}</div>
          )}
          
          {isLogin ? (
            <div>
              {[
                { label: 'Email Address', value: email, setter: setEmail, type: 'email', placeholder: 'Enter your email' },
                { label: 'Password', value: password, setter: setPassword, type: 'password', placeholder: 'Enter your password' }
              ].map((field, idx) => (
                <div key={idx} style={{ marginBottom: idx === 0 ? '1rem' : '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>{field.label}</label>
                  <input 
                    type={field.type}
                    value={field.value}
                    placeholder={field.placeholder}
                    onChange={(e) => field.setter(e.target.value)} 
                    required 
                    disabled={loading} 
                    style={{
                      width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem',
                      fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
                    }} 
                  />
                </div>
              ))}
              
              <button onClick={handleLogin} disabled={loading || !email || !password} style={{
                width: '100%', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white', border: 'none', padding: '0.875rem', borderRadius: '0.5rem',
                fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', transition: 'transform 0.1s'
              }}>{loading ? 'Signing In...' : 'Sign In'}</button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {[
                  { label: 'First Name', value: firstName, setter: setFirstName, placeholder: 'John' },
                  { label: 'Last Name', value: lastName, setter: setLastName, placeholder: 'Smith' }
                ].map((field, idx) => (
                  <div key={idx}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>{field.label}</label>
                    <input 
                      type="text"
                      value={field.value}
                      placeholder={field.placeholder}
                      onChange={(e) => field.setter(e.target.value)} 
                      required 
                      disabled={loading} 
                      style={{
                        width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem'
                      }} 
                    />
                  </div>
                ))}
              </div>

              {[
                { label: 'Company Name', value: companyName, setter: setCompanyName, placeholder: 'ABC Crane Services' },
                { label: 'Email Address', value: regEmail, setter: setRegEmail, type: 'email', placeholder: 'john@company.com' },
                { label: 'Password', value: regPassword, setter: setRegPassword, type: 'password', placeholder: 'Choose a secure password' }
              ].map((field, idx) => (
                <div key={idx} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>{field.label}</label>
                  <input 
                    type={field.type || 'text'}
                    value={field.value}
                    placeholder={field.placeholder}
                    onChange={(e) => field.setter(e.target.value)} 
                    required 
                    disabled={loading} 
                    style={{
                      width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem'
                    }} 
                  />
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>Phone</label>
                  <input 
                    type="tel" 
                    value={companyPhone} 
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="(555) 123-4567" 
                    disabled={loading} 
                    style={{
                      width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem'
                    }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>Plan</label>
                  <select 
                    value={plan} 
                    onChange={(e) => setPlan(e.target.value)} 
                    disabled={loading} 
                    style={{
                      width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem'
                    }}
                  >
                    <option value="starter">Starter ($49/mo)</option>
                    <option value="professional">Professional ($99/mo)</option>
                    <option value="enterprise">Enterprise ($199/mo)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>Address</label>
                <input 
                  type="text" 
                  value={companyAddress} 
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="123 Main St, City, State" 
                  disabled={loading} 
                  style={{
                    width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem'
                  }} 
                />
              </div>
              
              <button 
                onClick={handleRegistration} 
                disabled={loading || !regEmail || !regPassword || !companyName || !firstName || !lastName} 
                style={{
                  width: '100%', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white', border: 'none', padding: '0.875rem', borderRadius: '0.5rem',
                  fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          )}
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{
              background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer',
              textDecoration: 'underline', fontSize: '0.9rem'
            }}>
              {isLogin ? 'Need an account? Create one' : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
