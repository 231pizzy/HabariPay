// src/config/app.js
const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const limiter = require('./middleware/rateLimit');
const compression = require('./middleware/compression');
// const TransactionFee = require('./models/transactionFee');
const db = require('./config');
const router = require('./routes');


// Establish database connection
db.sync({ force: false })
  .then(() => {
  })
  .catch((err) => {
    console.error('Failed to connect to the database:', err);
  });

const app = express();
// app.use("/auth", authRouth);

// Security HTTP headers
app.use(helmet());

// Rate limiting
app.use(limiter);

// Compression
app.use(compression);

// Parse JSON request body
app.use(express.json({ limit: '5mb' }));

// Sanitize request data
app.use(xss());

// Enable CORS
app.use(cors());

// Define routes
app.use('/habariPay', router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;
