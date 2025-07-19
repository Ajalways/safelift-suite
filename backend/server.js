const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
});

// =============================================
// DATABASE MODELS
// =============================================

// Company Model
const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  zipCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  plan: {
    type: DataTypes.ENUM('starter', 'professional', 'enterprise'),
    defaultValue: 'starter'
  },
  planLimits: {
    type: DataTypes.JSON,
    defaultValue: {
      cranes: 5,
      operators: 10,
      users: 3
    }
  },
  subscriptionStatus: {
    type: DataTypes.ENUM('trial', 'active', 'past_due', 'canceled'),
    defaultValue: 'trial'
  },
  trialEndsAt: {
    type: DataTypes.DATE,
    defaultValue: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
  }
}, {
  tableName: 'companies',
  timestamps: true
});

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Company,
      key: 'id'
    }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [8, 255]
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'operator'),
    defaultValue: 'admin'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  emailVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// User instance methods
User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

// Define associations
Company.hasMany(User, { foreignKey: 'companyId', as: 'users' });
User.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// =============================================
// MIDDLEWARE
// =============================================

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Verify user still exists and is active
    const user = await User.findOne({
      where: { 
        id: decoded.userId, 
        status: 'active' 
      },
      include: [{
        model: Company,
        as: 'company'
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    req.user = {
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
      company: user.company
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    next();
  };
};

// Input validation middleware
const validateRegistration = (req, res, next) => {
  const {
    companyName, companyPhone, companyAddress,
    firstName, lastName, email, password, plan
  } = req.body;

  const errors = [];

  if (!companyName || companyName.length < 2) {
    errors.push('Company name must be at least 2 characters');
  }
  if (!companyPhone) {
    errors.push('Company phone is required');
  }
  if (!companyAddress) {
    errors.push('Company address is required');
  }
  if (!firstName) {
    errors.push('First name is required');
  }
  if (!lastName) {
    errors.push('Last name is required');
  }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.push('Valid email is required');
  }
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (plan && !['starter', 'professional', 'enterprise'].includes(plan)) {
    errors.push('Invalid plan selected');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors
    });
  }

  next();
};

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

// Middleware setup
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// =============================================
// BASIC ROUTES (WORKING)
// =============================================

// Health check endpoint - THIS WORKS
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'SafeLift Suite API',
    database: 'Connected',
    features: 'Authentication System'
  });
});

// Debug endpoint - TEST THIS
app.get('/debug', (req, res) => {
  res.json({
    message: 'Debug endpoint working',
    server_running: true,
    routes_available: [
      '/health - Health check (working)',
      '/debug - This debug endpoint',
      '/auth/register - Registration',
      '/auth/login - Login',
      '/auth/me - Get current user',
      '/test - API test with stats'
    ],
    note: 'If you see this, the server is working but API routing might have issues'
  });
});

// =============================================
// AUTHENTICATION ROUTES (ROOT LEVEL - TEST)
// =============================================

// Register new company and admin user - ROOT LEVEL
app.post('/auth/register', validateRegistration, async (req, res) => {
  try {
    const {
      companyName, companyPhone, companyAddress, companyCity, companyState, companyZip,
      firstName, lastName, email, phone, password, plan = 'starter'
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Set plan limits
    const planLimits = {
      starter: { cranes: 5, operators: 10, users: 3 },
      professional: { cranes: 15, operators: 25, users: 10 },
      enterprise: { cranes: 999, operators: 999, users: 50 }
    };

    // Create company
    const company = await Company.create({
      name: companyName,
      phone: companyPhone,
      address: companyAddress,
      city: companyCity,
      state: companyState,
      zipCode: companyZip,
      plan,
      planLimits: planLimits[plan]
    });

    // Create admin user
    const user = await User.create({
      companyId: company.id,
      firstName,
      lastName,
      email,
      phone,
      password,
      role: 'admin'
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        companyId: company.id,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: user.toJSON(),
      company: {
        id: company.id,
        name: company.name,
        plan: company.plan,
        subscriptionStatus: company.subscriptionStatus,
        trialEndsAt: company.trialEndsAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: error.errors.map(e => e.message)
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// Login user - ROOT LEVEL
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user with company
    const user = await User.findOne({
      where: { email, status: 'active' },
      include: [{
        model: Company,
        as: 'company'
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        companyId: user.companyId,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: user.toJSON(),
      company: {
        id: user.company.id,
        name: user.company.name,
        plan: user.company.plan,
        subscriptionStatus: user.company.subscriptionStatus,
        trialEndsAt: user.company.trialEndsAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Get current user - ROOT LEVEL
app.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      include: [{
        model: Company,
        as: 'company'
      }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.toJSON(),
      company: {
        id: user.company.id,
        name: user.company.name,
        plan: user.company.plan,
        subscriptionStatus: user.company.subscriptionStatus,
        trialEndsAt: user.company.trialEndsAt
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user'
    });
  }
});

// Database test endpoint - ROOT LEVEL
app.get('/test', async (req, res) => {
  try {
    await sequelize.authenticate();
    
    // Count companies and users
    const companyCount = await Company.count();
    const userCount = await User.count();
    
    res.json({ 
      message: 'SafeLift Suite API is running!',
      database: 'Connected',
      timestamp: new Date().toISOString(),
      stats: {
        companies: companyCount,
        users: userCount
      },
      features: ['Authentication', 'Multi-tenant', 'Role-based Access'],
      endpoints: {
        auth: {
          register: 'POST /auth/register',
          login: 'POST /auth/login',
          me: 'GET /auth/me'
        },
        api: {
          test: 'GET /test',
          health: 'GET /health',
          debug: 'GET /debug'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'SafeLift Suite API is running',
      database: 'Connection failed',
      error: error.message
    });
  }
});

// =============================================
// ORIGINAL API ROUTES (WITH /api PREFIX)
// =============================================

// Register new company and admin user
app.post('/api/auth/register', validateRegistration, async (req, res) => {
  try {
    const {
      companyName, companyPhone, companyAddress, companyCity, companyState, companyZip,
      firstName, lastName, email, phone, password, plan = 'starter'
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Set plan limits
    const planLimits = {
      starter: { cranes: 5, operators: 10, users: 3 },
      professional: { cranes: 15, operators: 25, users: 10 },
      enterprise: { cranes: 999, operators: 999, users: 50 }
    };

    // Create company
    const company = await Company.create({
      name: companyName,
      phone: companyPhone,
      address: companyAddress,
      city: companyCity,
      state: companyState,
      zipCode: companyZip,
      plan,
      planLimits: planLimits[plan]
    });

    // Create admin user
    const user = await User.create({
      companyId: company.id,
      firstName,
      lastName,
      email,
      phone,
      password,
      role: 'admin'
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        companyId: company.id,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: user.toJSON(),
      company: {
        id: company.id,
        name: company.name,
        plan: company.plan,
        subscriptionStatus: company.subscriptionStatus,
        trialEndsAt: company.trialEndsAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: error.errors.map(e => e.message)
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user with company
    const user = await User.findOne({
      where: { email, status: 'active' },
      include: [{
        model: Company,
        as: 'company'
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        companyId: user.companyId,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: user.toJSON(),
      company: {
        id: user.company.id,
        name: user.company.name,
        plan: user.company.plan,
        subscriptionStatus: user.company.subscriptionStatus,
        trialEndsAt: user.company.trialEndsAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      include: [{
        model: Company,
        as: 'company'
      }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.toJSON(),
      company: {
        id: user.company.id,
        name: user.company.name,
        plan: user.company.plan,
        subscriptionStatus: user.company.subscriptionStatus,
        trialEndsAt: user.company.trialEndsAt
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user'
    });
  }
});

// Logout (client-side token removal)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Database test endpoint
app.get('/api/test', async (req, res) => {
  try {
    await sequelize.authenticate();
    
    // Count companies and users
    const companyCount = await Company.count();
    const userCount = await User.count();
    
    res.json({ 
      message: 'SafeLift Suite API is running!',
      database: 'Connected',
      timestamp: new Date().toISOString(),
      stats: {
        companies: companyCount,
        users: userCount
      },
      features: ['Authentication', 'Multi-tenant', 'Role-based Access']
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'SafeLift Suite API is running',
      database: 'Connection failed',
      error: error.message
    });
  }
});

// =============================================
// PROTECTED ROUTES (Examples)
// =============================================

// Get company users (Admin only)
app.get('/api/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const users = await User.findAll({
      where: { companyId: req.user.companyId },
      include: [{
        model: Company,
        as: 'company',
        attributes: ['name', 'plan']
      }]
    });

    res.json({
      success: true,
      users: users.map(user => user.toJSON())
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users'
    });
  }
});

// Add new user to company (Admin only)
app.post('/api/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role = 'operator' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    const user = await User.create({
      companyId: req.user.companyId,
      firstName,
      lastName,
      email,
      phone,
      password: tempPassword,
      role
    });

    res.status(201).json({
      success: true,
      user: user.toJSON(),
      tempPassword // In production, send this via email
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.errors.map(e => e.message)
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    available_endpoints: [
      'GET /health',
      'GET /debug', 
      'GET /test',
      'POST /auth/register',
      'POST /auth/login',
      'GET /auth/me'
    ]
  });
});

// Start server
async function startServer() {
  await testConnection();
  
  app.listen(PORT, () => {
    console.log(`🚀 SafeLift Suite API running on port ${PORT}`);
    console.log(`🔐 Authentication system enabled`);
    console.log(`🏢 Multi-tenant architecture ready`);
  });
}

startServer();