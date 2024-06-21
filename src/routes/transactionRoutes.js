const express = require('express');
const authMiddleware = require('../middleware/authenticateToken');
const { createVirtualAccountTransaction, createCardTransaction, getAvailableBalance, getPendingSettlement } = require('../controllers/transactionController');


const router = express.Router();

router.post('/create-virtual-account-transaction', authMiddleware, createVirtualAccountTransaction);
router.post('/create-card-transaction', authMiddleware, createCardTransaction);
router.get('/available-balance', authMiddleware, getAvailableBalance);
router.get('/pending-settlement', authMiddleware, getPendingSettlement);

module.exports = router;