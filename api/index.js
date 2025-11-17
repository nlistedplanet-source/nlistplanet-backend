const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2,
  process.env.FRONTEND_URL_3,
  'http://localhost:3000',
  'https://nlistplanet.vercel.app'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const vercelPreviewRegex = /^https:\/\/nlistplanet-[a-z0-9-]+\.vercel\.app$/i;
    if (allowedOrigins.includes(origin) || vercelPreviewRegex.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection with caching
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        bufferCommands: false,
      });
      cachedDb = mongoose.connection;
      console.log('✅ MongoDB Connected');
    } catch (err) {
      console.error('❌ MongoDB Error:', err);
    }
  }
  return cachedDb;
}

// Routes - using absolute paths from project root
const authRoutes = require('../routes/auth');
const usersRoutes = require('../routes/users');
const listingsRoutes = require('../routes/listings');
const bidsRoutes = require('../routes/bids');
const companiesRoutes = require('../routes/companies');
const portfolioRoutes = require('../routes/portfolio');
const tradesRoutes = require('../routes/trades');

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/bids', bidsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/trades', tradesRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'UnlistedHub Backend API',
    health: '/api/health'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Export for Vercel serverless
module.exports = async (req, res) => {
  await connectToDatabase();
  return app(req, res);
};
