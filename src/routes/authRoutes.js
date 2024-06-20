const express = require('express');
const { registerMerchant, loginMerchant, registerMerchantValidationRules, loginMerchantValidationRules } = require('../controllers/merchantController');

const router = express.Router();

router.post('/register', registerMerchantValidationRules(), registerMerchant);
router.post('/login', loginMerchantValidationRules(), loginMerchant);

module.exports = router;
