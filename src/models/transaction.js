// const { DataTypes } = require('sequelize');
// const db = require('../config');

//   const Transaction = db.define('Transaction', {
//     reference: {
//       type: DataTypes.STRING,
//       unique: true,
//       allowNull: false
//     },
//     transactionValue:{
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     TransactionDescription:{
//       type: DataTypes.STRING,
//     },
//     cardNumber: {
//       type: DataTypes.STRING,
//     },
//     cardHolderName:{

//       type: DataTypes.STRING,
//     },
//     cardExpiryDate: {
//       type: DataTypes.STRING,
//     },
//     cardVerificationCode:{
//       type: DataTypes.STRING,
//     },
//     customerAccountName:{
//       type: DataTypes.STRING,
//     },
//     customerAccountNumber:{
//       type: DataTypes.STRING,
//     },
//     customerBankCode:{
//       type: DataTypes.STRING,
//     },
//     currency:{
//       type: DataTypes.STRING,
//     },
//     status: {
//       type: DataTypes.STRING,
//       defaultValue: 'pending',
//     },
//     fee:{
//       type: DataTypes.FLOAT,
//     }
//   }, {});

//   Transaction.associate = models => {
//     Transaction.belongsTo(models.Merchant, { foreignKey: 'merchantId' });
//   };

//   module.exports = Transaction;

// models/transaction.js
const { DataTypes } = require('sequelize');
const db = require('../config');

const Transaction = db.define('Transaction', {
  reference: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  transactionValue: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  transactionDescription: {
    type: DataTypes.STRING,
  },
  cardNumber: {
    type: DataTypes.STRING,
  },
  cardHolderName: {
    type: DataTypes.STRING,
  },
  cardExpiryDate: {
    type: DataTypes.STRING,
  },
  cardVerificationCode: {
    type: DataTypes.STRING,
  },
  customerAccountName: {
    type: DataTypes.STRING,
  },
  customerAccountNumber: {
    type: DataTypes.STRING,
  },
  customerBankCode: {
    type: DataTypes.STRING,
  },
  currency: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  fee: {
    type: DataTypes.FLOAT,
  },
  merchantId: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
  Payoutstatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
}, {});

Transaction.associate = (models) => {
  Transaction.belongsTo(models.Merchant, { foreignKey: 'merchantId' });
  Transaction.belongsTo(models.User, { foreignKey: 'userId' });
  Transaction.hasOne(models.TransactionFee, { foreignKey: 'transactionId' });
};

module.exports = Transaction;
