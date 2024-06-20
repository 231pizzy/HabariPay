// config/models.js
const db = require('./dbConfig');
const User = require('../models/user');
const Merchant = require('../models/merchant');
const Transaction = require('../models/transaction');
const TransactionFee = require('../models/transactionFee');
const Payout = require('../models/payout');

// Define associations
User.associate = (models) => {
  User.hasMany(models.Transaction, { foreignKey: 'userId' });
};

Merchant.associate = (models) => {
  Merchant.hasMany(models.Transaction, { foreignKey: 'merchantId' });
  Merchant.hasMany(models.Payout, { foreignKey: 'merchantId' });
};

Transaction.associate = (models) => {
  Transaction.belongsTo(models.Merchant, { foreignKey: 'merchantId' });
  Transaction.belongsTo(models.User, { foreignKey: 'userId' });
  Transaction.hasOne(models.TransactionFee, { foreignKey: 'transactionId' });
};

TransactionFee.associate = (models) => {
  TransactionFee.belongsTo(models.Transaction, { foreignKey: 'transactionId' });
};

Payout.associate = (models) => {
  Payout.belongsTo(models.Merchant, { foreignKey: 'merchantId' });
};

// Sync function to ensure models are synchronized with the database
const syncModels = async () => {
  User.associate({ Transaction });
  Merchant.associate({ Transaction, Payout });
  Transaction.associate({ Merchant, User, TransactionFee });
  TransactionFee.associate({ Transaction });
  Payout.associate({ Merchant });

  await db.sync({ force: true }); // Use { force: true } only for testing
};

module.exports = { db, User, Merchant, Transaction, TransactionFee, Payout, syncModels };
