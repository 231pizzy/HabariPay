const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const db = require('../config');
const User = require('../models/user');
const Merchant = require('../models/merchants');
const Transaction = require('../models/transaction');
const TransactionFee = require('../models/transactionFee');
const moment = require('moment');

const createVirtualAccountTransaction = async (req, res) => {
  const { accountNumber, value, description, currency, pin } = req.body;
  const merchantId = req.merchantId;

  try {
    // Find the merchant based on merchantId from the header token
    const merchant = await Merchant.findOne({ where: { merchantId } });
    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant not found' });
    }

    // Find the user based on the provided accountNumber
    const user = await User.findOne({ where: { accountNumber } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid account number' });
    }

    // Check transaction pin
    const isPinValid = await bcrypt.compare(pin, user.transactionPin);
    if (!isPinValid) {
      return res.status(401).json({ message: 'Invalid transaction pin' });
    }

    // Check if user has sufficient balance
    const transactionValue = parseFloat(value);
    const userBalance = parseFloat(user.accountBalance);
    if (userBalance < transactionValue) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Calculate fee (5% of transaction value)
    const feePercentage = 0.05;
    const feeAmount = transactionValue * feePercentage;

    // Start a transaction using Sequelize
    const transaction = await db.transaction();

    try { 
      // Update user balance (deduct transaction amount)
      await User.update(
        { accountBalance: userBalance - transactionValue },
        { where: { id: user.id }, transaction }
      );

      // Create the transaction record
      const reference = uuidv4();
      const newTransaction = await Transaction.create(
        {
          reference,
          transactionValue: transactionValue,
          transactionDescription: description,
          customerAccountNumber: accountNumber,
          customerBankCode: user.bankCode,
          customerAccountName: user.name,
          currency,
          fee: feeAmount,
          status: 'success',
          merchantId: merchant.merchantId,
        },
        { transaction }
      );

      // Find or create the TransactionFee record (feeWallet)
      const [transactionFee] = await TransactionFee.findOrCreate({
        where: { accountName: 'feeWallet', accountNumber: '0073231303' },
        defaults: { accountBalance: 0, bankCode: '058' },
        transaction
      });

      // Update TransactionFee account balance with fee amount
      await TransactionFee.update(
        { accountBalance: parseFloat(transactionFee.accountBalance) + feeAmount },
        { where: { id: transactionFee.id }, transaction }
      );

      // Commit the transaction
      await transaction.commit();

      return res.status(200).json({ success: true, message: 'Transaction completed successfully', transaction: newTransaction });
    } catch (error) {
      // Rollback the transaction on error
      await transaction.rollback();
      console.error('Error creating transaction:', error);
      return res.status(500).json({ success: false, message: 'Transaction failed. Please try again later.' });
    }
  } catch (error) {
    console.error('Error in transaction service:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// const createCardTransaction = async (req, res) => {
//   const { value, description, cardNumber, cardHolderName, cardExpiryDate, cvv, currency } = req.body;
//   const merchantId = req.merchantId;

//   try {
//     // Find the merchant based on merchantId from the header token
//     const merchant = await Merchant.findOne({ where: { merchantId } });
//     if (!merchant) {
//       return res.status(404).json({ success: false, message: 'Merchant not found' });
//     }

//     // Remove spaces from the card number for validation
//     const sanitizedCardNumber = cardNumber.replace(/\s+/g, '');

//     // Validate card details (in a real-world scenario, you'd validate the card with a payment gateway)
//     if (!sanitizedCardNumber || sanitizedCardNumber.length !== 16 || isNaN(sanitizedCardNumber)) {
//       return res.status(400).json({ success: false, message: 'Invalid card number. Card number must be 16 digits long.' });
//     }
//     if (!cardHolderName) {
//       return res.status(400).json({ success: false, message: 'Card holder name is required.' });
//     }
//     if (!cardExpiryDate || !moment(cardExpiryDate, 'DD-MM-YYYY', true).isValid() || moment(cardExpiryDate, 'DD-MM-YYYY').isBefore(moment(), 'day')) {
//       return res.status(400).json({ success: false, message: 'Invalid or expired card expiration date.' });
//     }
//     if (!cvv || cvv.length !== 3) {
//       return res.status(400).json({ success: false, message: 'Invalid CVV. CVV must be 3 digits long.' });
//     }

//     // Calculate fee (3% of transaction value)
//     const feePercentage = 0.03;
//     const feeAmount = parseFloat(value) * feePercentage;
//     const transactionValue = parseFloat(value);

//     // Extract the last 4 digits of the card number
//     const last4CardDigits = cardNumber.slice(-4);

//     // Start a transaction using Sequelize
//     const transaction = await db.transaction();

//     try {
//       // Create the transaction record
//       const reference = uuidv4();
//       const newTransaction = await Transaction.create(
//         {
//           reference,
//           transactionValue,
//           transactionDescription: description,
//           cardNumber: last4CardDigits, // Store only the last 4 digits
//           cardHolderName,
//           cardExpiryDate,
//           cardVerificationCode: cvv,
//           currency,
//           fee: feeAmount,
//           status: 'pending',
//           merchantId: merchant.id,
//         },
//         { transaction }
//       );

//       // Update merchant's account balance with the transaction amount minus the fee
//       const merchantAmount = transactionValue - feeAmount;
//       await Merchant.update(
//         { accountBalance: parseFloat(merchant.accountBalance) + merchantAmount },
//         { where: { id: merchant.id }, transaction }
//       );

//       // Find or create the TransactionFee record (feeWallet)
//       const [transactionFee] = await TransactionFee.findOrCreate({
//         where: { accountName: 'feeWallet', accountNumber: '0073231303' },
//         defaults: { accountBalance: 0, bankCode: '058' },
//         transaction
//       });

//       // Update TransactionFee account balance with fee amount
//       await TransactionFee.update(
//         { accountBalance: parseFloat(transactionFee.accountBalance) + feeAmount },
//         { where: { id: transactionFee.id }, transaction }
//       );

//       // Commit the transaction
//       await transaction.commit();

//       return res.status(200).json({ success: true, message: 'Transaction completed successfully', transaction: newTransaction });
//     } catch (error) {
//       // Rollback the transaction on error
//       await transaction.rollback();
//       console.error('Error creating transaction:', error);
//       return res.status(500).json({ success: false, message: 'Transaction failed. Please try again later.' });
//     }
//   } catch (error) {
//     console.error('Error in transaction service:', error);
//     return res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

const createCardTransaction = async (req, res) => {
  const { value, description, cardNumber, cardHolderName, cardExpiryDate, cvv, currency } = req.body;
  const merchantId = req.merchantId;

  try {
    // Find the merchant based on merchantId from the header token
    const merchant = await Merchant.findOne({ where: { merchantId } });
    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant not found' });
    }

    // Remove spaces from the card number for validation
    const sanitizedCardNumber = cardNumber.replace(/\s+/g, '');

    // Validate card details (in a real-world scenario, you'd validate the card with a payment gateway)
    if (!sanitizedCardNumber || sanitizedCardNumber.length !== 16 || isNaN(sanitizedCardNumber)) {
      return res.status(400).json({ success: false, message: 'Invalid card number. Card number must be 16 digits long.' });
    }
    if (!cardHolderName) {
      return res.status(400).json({ success: false, message: 'Card holder name is required.' });
    }
      if (!cardExpiryDate || !moment(cardExpiryDate, 'DD-MM-YYYY', true).isValid() || moment(cardExpiryDate, 'DD-MM-YYYY').isBefore(moment(), 'day')) {
      return res.status(400).json({ success: false, message: 'Invalid or expired card expiration date.' });
    }
    if (!cvv || cvv.length !== 3 || isNaN(cvv)) {
      return res.status(400).json({ success: false, message: 'Invalid CVV. CVV must be 3 digits long.' });
    }

    // Calculate fee (3% of transaction value)
    const feePercentage = 0.03;
    const feeAmount = parseFloat(value) * feePercentage;
    const transactionValue = parseFloat(value);

    // Extract the last 4 digits of the card number
    const last4CardDigits = cardNumber.slice(-4);

    // Start a transaction using Sequelize
    const transaction = await db.transaction();

    try {
      // Create the transaction record with status = pending
      const reference = uuidv4();
      const newTransaction = await Transaction.create(
        {
          reference,
          transactionValue,
          transactionDescription: description,
          cardNumber: last4CardDigits, // Store only the last 4 digits
          cardHolderName,
          cardExpiryDate,
          cardVerificationCode: cvv,
          currency,
          fee: feeAmount,
          status: 'pending',
          merchantId: merchant.merchantId,
        },
        { transaction }
      );

      // Commit the transaction
      await transaction.commit();

      return res.status(200).json({ success: true, message: 'Transaction created successfully', transaction: newTransaction });
    } catch (error) {
      // Rollback the transaction on error
      await transaction.rollback();
      console.error('Error creating transaction:', error);
      return res.status(500).json({ success: false, message: 'Transaction failed. Please try again later.' });
    }
  } catch (error) {
    console.error('Error in transaction service:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getTransactions = async (req, res) => {
  // Your logic to get transactions
};

const settleTransaction = async (req, res) => {
  // Your logic to settle transactions
};

module.exports = {
  createVirtualAccountTransaction,
  createCardTransaction,
  getTransactions,
  settleTransaction,
};
