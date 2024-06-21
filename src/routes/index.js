const express = require('express');
const transactionRoutes = require('./transactionRoutes');
const payoutRoutes = require('./payoutRoute');
const authRoutes = require('./authRoutes');
const userRoute = require('./userRoute');

const router = express.Router();

// Root endpoint for mic check
router.get('/', (req, res) => {
  res.status(200).send({ message: 'It Works' });
});

router.use('/transactions', transactionRoutes);
router.use('/payout', payoutRoutes);
router.use('/auth', authRoutes);
router.use('/user', userRoute);


module.exports = router;
