const { validationResult, body } = require('express-validator');
const bcrypt = require('bcrypt');
const Merchant = require('../models/merchants');
const { generateToken } = require('../utils/token');
const { v4: uuidv4 } = require('uuid');
const generateAccountNumber = require('../utils/generateAccount');

// Validation rules for registerMerchant endpoint
const registerMerchantValidationRules = () => {
  return [
    body('businessName').notEmpty(),
    body('country').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('phoneNumber').isMobilePhone(),
  ];
};

// Validation rules for registerMerchant endpoint
const loginMerchantValidationRules = () => {
    return [
      body('email').isEmail(),
      body('password').isLength({ min: 6 }),
    ];
  };

// Register merchant function
const registerMerchant = async (req, res) => {
    try {
        const { businessName, country, email, password, phoneNumber } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const merchantId = uuidv4().replace(/-/g, '').slice(0, 15);
        const accountNumber = generateAccountNumber();

        const normalizedEmail = email.toLowerCase();

        const merchant = await Merchant.create({
            businessName,
            country,
            email: normalizedEmail,
            password,
            phoneNumber,
            merchantId,
            accountNumber
        });

        return res.status(201).json({ message: 'Merchant registered successfully', merchant });
    } catch (error) {
        console.error(error);

        // Handle unique constraint error for email
        if (error.name === 'SequelizeUniqueConstraintError' && error.errors[0]?.path === 'email') {
            // Return a generic message for user
            return res.status(400).json({ message: 'Email already exists', field: 'email' });
        }

        // Log the error for internal debugging purposes
        // Ensure not to expose sensitive details in the log
        console.error('Error occurred while registering merchant:', error);

        return res.status(500).json({ message: 'An error occurred while registering the merchant.' });
    }
};

// Login merchant function
const loginMerchant = async (req, res) => {

  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase();

    // Validate request body against defined rules
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Find merchant by email
    const merchant = await Merchant.findOne({ where: { email: normalizedEmail } });
    console.log("m id:", merchant.merchantId)

    // If merchant not found or password does not match, return 401 Unauthorized
    if (!merchant || !await bcrypt.compare(password, merchant.password)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken({ merchantId: merchant.merchantId });

    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while logging in.' });
  }
};

module.exports = {
  registerMerchantValidationRules,
  loginMerchantValidationRules,
  registerMerchant,
  loginMerchant,
};
