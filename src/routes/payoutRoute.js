const express = require('express');
const authMiddleware = require('../middleware/authenticateToken');
const { createPayout } = require('../controllers/payoutController');

const router = express.Router();

router.post('/create-payout', authMiddleware, createPayout);

module.exports = router;