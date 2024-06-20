const { DataTypes } = require('sequelize');
 const db = require('../config');
const bcrypt = require('bcrypt');

const Merchant = db.define('Merchant', {
  businessName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  merchantId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  accountNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
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

Merchant.beforeCreate(async (merchant) => {
  merchant.password = await bcrypt.hash(merchant.password, 10);
});

Merchant.associate = (models) => {
  Merchant.hasMany(models.Transaction, {
  foreignKey: 'merchantId',
  as: 'transactions',
  });
  };

module.exports = Merchant;
