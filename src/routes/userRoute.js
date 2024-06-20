const express = require('express');
const { createUser, createUserValidationRules } = require('../controllers/userControllers');

const router = express.Router();

router.post('/create-user', createUserValidationRules(), createUser);

module.exports = router;