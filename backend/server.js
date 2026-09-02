const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');
require('express-async-errors');

// Force IPv4 first to prevent IPv6 ENETUNREACH / hanging timeouts on cloud hosts like Render
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Load environment variables
dotenv.config();

const app = express();

const normalizeOrigin = (origin) => {
  if (!origin) {
    return '';
  }

  try {
    const url = new URL(origin);
    return `${url.protocol}//${url.host}`;
  } catch (error) {
    return origin.replace(/\/$/, '');
  }
};

const parseOriginList = (...values) => values
  .filter(Boolean)
  .flatMap((value) => value.split(','))
  .map((origin) => normalizeOrigin(origin.trim()))
  .filter(Boolean);

const allowedOrigins = new Set(parseOriginList(
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://canteen-swart.vercel.app',
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URLS,
  process.env.CORS_ORIGINS
));

const isPrivateNetworkHost = (hostname) => (
  hostname === 'localhost'
  || hostname === '0.0.0.0'
  || hostname === '[::1]'
  || hostname === '::1'
  || hostname === '127.0.0.1'
  || hostname.startsWith('127.')
  || hostname.startsWith('10.')
  || hostname.startsWith('192.168.')
  || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
);

const isDevelopmentOrigin = (origin) => {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  try {
    const { hostname, protocol } = new URL(origin);
    return ['http:', 'https:'].includes(protocol) && isPrivateNetworkHost(hostname);
  } catch (error) {
    return false;
  }
};

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = normalizeOrigin(origin);

  if (allowedOrigins.has(normalizedOrigin) || isDevelopmentOrigin(normalizedOrigin)) {
    return true;
  }

  return false;
};

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    const error = new Error(`Origin ${origin} is not allowed by CORS`);
    error.status = 403;
    error.code = 'CORS_NOT_ALLOWED';
    return callback(error);
  },
  credentials: true,
  optionsSuccessStatus: 204,
  maxAge: 86400,
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Database Connection
const connectDB = require('./config/database');

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/hero-slides', require('./routes/heroSlideRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/location', require('./routes/locationRoutes'));

// Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Shop Karo API is running' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON request body' });
  }

  if (err.code === 'CORS_NOT_ALLOWED') {
    console.warn(err.message);
  } else {
    console.error(err.message || 'Unhandled server error');
  }

  const status = err.status || 500;
  const message = status >= 500 && process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start Server
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB().then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the existing process or set PORT to another value.`);
      } else {
        console.error(`Server failed to start: ${error.message}`);
      }
      process.exit(1);
    });
  }).catch(() => {
    process.exit(1);
  });
} else {
  connectDB().catch((error) => {
    console.error(`Database initialization failed: ${error.message}`);
  });
}

module.exports = app;
