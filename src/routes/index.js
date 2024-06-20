// const express = require('express');
// const transactionRoutes = require('./transactionRoutes');
// // const payoutRoutes = require('./payoutRoutes');
// const authRoutes = require('./authRoutes');
// const userRoute = require('./userRoute');

// // const merchantRoutes = require('./merchantRoutes');

// const router = express.Router();

// router.use('/transactions', transactionRoutes);
// // router.use('/payouts', payoutRoutes);
// router.use('/auth', authRoutes);
// router.use('/user', userRoute);
// // router.use('/merchants', merchantRoutes);

// module.exports = router;
const express = require('express');
const transactionRoutes = require('./transactionRoutes');
// const payoutRoutes = require('./payoutRoutes');
const authRoutes = require('./authRoutes');
const userRoute = require('./userRoute');
// const merchantRoutes = require('./merchantRoutes');

const router = express.Router();

// Root endpoint for mic check
router.get('/', (req, res) => {
  res.status(200).send({ message: 'It Works' });
});

router.use('/transactions', transactionRoutes);
// router.use('/payouts', payoutRoutes);
router.use('/auth', authRoutes);
router.use('/user', userRoute);
// router.use('/merchants', merchantRoutes);

module.exports = router;
