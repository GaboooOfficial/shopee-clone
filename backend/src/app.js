const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// --- Global Middleware ---
app.use(helmet()); // Security headers
app.use(cors({ 
  origin: process.env.FRONTEND_URL,
  credentials: true 
})); // CORS protection
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- Health Check Route ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Shopee Clone API is running',
    timestamp: new Date().toISOString() 
  });
});

// --- Module Routes ---
app.use('/api/auth', require('./modules/auth/routes'));
app.use('/api/categories', require('./modules/category/routes'));
app.use('/api/admin', require('./modules/admin/routes'));
app.use('/api/stores', require('./modules/store/routes'));
app.use('/api/products', require('./modules/product/routes'));
app.use('/api/orders', require('./modules/order/routes'));
app.use('/api/messages', require('./modules/message/routes'));

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error('💥 Unhandled Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;