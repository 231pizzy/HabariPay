// src/controllers/userController.js
const User = require('../models/user');
const { validationResult, body } = require('express-validator');
const bcrypt = require('bcrypt');
const generateAccountNumber = require('../utils/generateAccount');

// Validation rules for creating a user
const createUserValidationRules = () => {
  return [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('transactionPin').isLength({ min: 5 }),
    body('accountBalance').isFloat({ gt: 0 }).withMessage('Account balance must be a positive number'),
  ];
};


// Create user function
const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, transactionPin, accountBalance } = req.body;

    // Hash transactionPin
    const hashedTransactionPin = await bcrypt.hash(transactionPin, 10);

    // Generate accountNumber and bankCode
    const accountNumber = generateAccountNumber();
    const bankCodes = ['058', '068', '078'];
    const bankCode = bankCodes[Math.floor(Math.random() * bankCodes.length)];

    // Create user with all necessary fields
    const user = await User.create({
      name,
      email,
      transactionPin: hashedTransactionPin,
      accountNumber,
      accountBalance,
      bankCode,
    });

    return res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while creating the user.' });
  }
};

module.exports = {
  createUserValidationRules,
  createUser,
};
