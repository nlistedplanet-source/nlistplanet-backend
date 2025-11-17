const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration to support production + preview deployments
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

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/bids', require('./routes/bids'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/trades', require('./routes/trades'));

// MongoDB Connection with caching for serverless
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
      });
      isConnected = true;
      console.log('✅ MongoDB Connected');
    } catch (err) {
      console.error('❌ MongoDB Connection Error:', err);
      throw err;
    }
  } else {
    console.warn('⚠️ MONGODB_URI not set - skipping DB connection');
  }
};

// Connect to database on startup (for local dev)
if (require.main === module) {
  connectDB();
}

// Middleware to ensure DB connection for each request (serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
