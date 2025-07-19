const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'safelift-super-secret-jwt-key-2025';

//// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Database Models
const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  plan: {
    type: DataTypes.ENUM('starter', 'professional', 'enterprise'),
    defaultValue: 'starter'
  }
});

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'operator'),
    defaultValue: 'admin'
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

// Associations
Company.hasMany(User, { foreignKey: 'companyId' });
User.belongsTo(Company, { foreignKey: 'companyId' });

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
    console.log('🔐 Authentication system enabled');
    console.log('🏢 Multi-tenant architecture ready');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'SafeLift Suite API',
    database: 'Connected',
    features: 'Authentication System',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  res.json({
    message: 'SafeLift Suite API Debug',
    endpoints: [
      'POST /auth/register',
      'POST /auth/login',
      'GET /auth/me',
      'GET /health',
      'GET /debug'
    ],
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/test', async (req, res) => {
  try {
    const companyCount = await Company.count();
    const userCount = await User.count();
    
    res.json({
      message: 'SafeLift Suite API Working',
      database: 'Connected',
      stats: {
        companies: companyCount,
        users: userCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      message: 'SafeLift Suite API Working',
      database: 'Error',
      error: error.message
    });
  }
});

// Registration endpoint
app.post('/auth/register', async (req, res) => {
  try {
    const { companyName, companyPhone, companyAddress, plan, firstName, lastName, email, password } = req.body;

    if (!companyName || !firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'All required fields must be provided'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create company
    const company = await Company.create({
      name: companyName,
      phone: companyPhone || 'Not provided',
      address: companyAddress || 'Not provided',
      plan: plan || 'starter'
    });

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'admin',
      companyId: company.id
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, companyId: company.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        company: {
          id: company.id,
          name: company.name,
          plan: company.plan
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({
      where: { email },
      include: [Company]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, companyId: user.companyId, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        company: {
          id: user.Company.id,
          name: user.Company.name,
          plan: user.Company.plan
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
});

// Get current user endpoint
app.get('/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      include: [Company]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        company: {
          id: user.Company.id,
          name: user.Company.name,
          plan: user.Company.plan
        }
      }
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// Start server
async function startServer() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 SafeLift Suite API running on port ${PORT}`);
  });
}

startServer();