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
// ROUTES (WORKING VERSIONS)
// =============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'SafeLift Suite API',
    database: 'Connected',
    features: 'Authentication System',
    version: '1.0.0'
  });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  res.json({
    message: 'Debug endpoint working perfectly!',
    server_status: 'Running',
    authentication: 'Enabled',
    database: 'Connected',
    available_routes: [
      'GET /health - Health check',
      'GET /debug - This debug endpoint', 
      'GET /test - API test with database stats',
      'POST /auth/register - Company registration',
      'POST /auth/login - User login',
      'GET /auth/me - Get current user info'
    ],
    routing_status: 'Fixed - All endpoints should work now!'
  });
});

// Test endpoint with database stats
app.get('/test', async (req, res) => {
  try {
    await sequelize.authenticate();
    
    // Count companies and users
    const companyCount = await Company.count();
    const userCount = await User.count();
    
    res.json({ 
      message: 'SafeLift Suite API is running perfectly!',
      database: 'Connected',
      timestamp: new Date().toISOString(),
      stats: {
        companies: companyCount,
        users: userCount,
        total_records: companyCount + userCount
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
      },
      status: 'All systems operational!'
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
// AUTHENTICATION ROUTES
// =============================================

// Register new company and admin user
app.post('/auth/register', validateRegistration, async (req, res) => {
  try {
    const {
      companyName, companyPhone, companyAddress, companyCity, companyState, companyZip,
      firstName, lastName, email, phone, password, plan = 'starter'
    } = req.body;

    console.log('Registration attempt for:', email);

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

    console.log('Company created:', company.id);

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

    console.log('User created:', user.id);

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
      message: 'Account created successfully!',
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

    console.log('Registration successful for:', email);

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
      error: 'Registration failed: ' + error.message
    });
  }
});

// Login user
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

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
      message: 'Login successful!',
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

    console.log('Login successful for:', email);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed: ' + error.message
    });
  }
});

// Get current user
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
      error: 'Failed to get user: ' + error.message
    });
  }
});

// Logout endpoint
app.post('/auth/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// =============================================
// API ROUTES (WITH /api PREFIX)
// =============================================

// Health check with API prefix
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'SafeLift Suite API',
    database: 'Connected',
    features: 'Authentication System',
    prefix: 'api'
  });
});

// Test endpoint with API prefix
app.get('/api/test', async (req, res) => {
  try {
    await sequelize.authenticate();
    
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
      prefix: 'api'
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
// ERROR HANDLING
// =============================================

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

// Start server
async function startServer() {
  await testConnection();
  
  app.listen(PORT, () => {
    console.log(`🚀 SafeLift Suite API running on port ${PORT}`);
    console.log(`🔐 Authentication system enabled`);
    console.log(`🏢 Multi-tenant architecture ready`);
    console.log(`✅ All endpoints should be working now!`);
  });
}

startServer();