const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'SafeLift Suite API'
  });
});

// Basic API endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'SafeLift Suite API is running!' });
});

app.listen(PORT, () => {
  console.log(`SafeLift Suite API running on port ${PORT}`);
});