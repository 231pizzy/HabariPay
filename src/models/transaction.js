// src/models/transaction.js
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    reference: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    value: DataTypes.STRING,
    description: DataTypes.STRING,
    cardNumber: DataTypes.STRING,
    cardHolderName: DataTypes.STRING,
    cardExpiry: DataTypes.STRING,
    cardCvv: DataTypes.STRING,
    accountName: DataTypes.STRING,
    accountNumber: DataTypes.STRING,
    bankCode: DataTypes.STRING,
    currency: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending', // Default status
    },
    fee: DataTypes.FLOAT,
  }, {});

  Transaction.associate = models => {
    Transaction.belongsTo(models.Merchant, { foreignKey: 'merchantId' });
  };

  return Transaction;
};
