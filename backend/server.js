const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
require('express-async-errors');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000',
    "https://canteen-yuvg.onrender.com"],
  credentials: true
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Database Connection
const connectDB = require('./config/database');
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
