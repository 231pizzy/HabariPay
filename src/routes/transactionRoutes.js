const express = require('express');
const authMiddleware = require('../middleware/authenticateToken');
const { createVirtualAccountTransaction, createCardTransaction } = require('../controllers/transactionController');


const router = express.Router();

router.post('/create-virtual-account-transaction', authMiddleware, createVirtualAccountTransaction);
router.post('/create-card-transaction', authMiddleware, createCardTransaction);

module.exports = router;