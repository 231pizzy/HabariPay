// transactionFee.js

const { DataTypes } = require('sequelize');
const db = require('../config');

const TransactionFee = db.define('TransactionFee', {
  accountName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  accountBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
  bankCode: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '058',
  },
});

// Define a function to create the default TransactionFee if it doesn't exist
const createDefaultTransactionFee = async () => {
  const existingFeeWallet = await TransactionFee.findOne({
    where: {
      accountName: 'feeWallet',
      accountNumber: '0073231303',
    },
  });

  if (!existingFeeWallet) {
    await TransactionFee.create({
      accountName: 'feeWallet',
      accountNumber: '0073231303',
      accountBalance: 0.0, 
      bankCode: '058', 
    });
  }
};

// Sequelize hook to create the default TransactionFee after model sync
TransactionFee.afterSync(async () => {
  await createDefaultTransactionFee();
});

module.exports = TransactionFee;
// const { DataTypes } = require('sequelize');
// const db = require('../config');

// const TransactionFee = db.define('TransactionFee', {
//   accountName: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   accountNumber: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//   },
//   accountBalance: {
//     type: DataTypes.DECIMAL(10, 2),
//     allowNull: false,
//     defaultValue: 0.0,
//   },
//   bankCode: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     defaultValue: '058',
//   },
// });

// // Define a function to create the default TransactionFee if it doesn't exist
// const createDefaultTransactionFee = async () => {
//   const existingFeeWallet = await TransactionFee.findOne({
//     where: {
//       accountName: 'feeWallet',
//       accountNumber: '0073231303',
//     },
//   });

//   if (!existingFeeWallet) {
//     await TransactionFee.create({
//       accountName: 'feeWallet',
//       accountNumber: '0073231303',
//       accountBalance: 0.0,
//       bankCode: '058',
//     });
//   }
// };

// module.exports = { TransactionFee, createDefaultTransactionFee };
