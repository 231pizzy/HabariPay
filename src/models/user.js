// src/models/user.js
const { DataTypes } = require('sequelize');
const db = require('../config');

const User = db.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  transactionPin: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  accountBalance: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
    allowNull: false,
  },
  bankCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {});

module.exports = User;
