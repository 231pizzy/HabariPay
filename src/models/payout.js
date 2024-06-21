const { DataTypes } = require('sequelize');
const db = require('../config');

const Payout = db.define('Payout', {
  reference: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
  businessName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  merchantId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {});

Payout.associate = (models) => {
  Payout.belongsTo(models.Merchant, { foreignKey: 'merchantId' });
};

module.exports = Payout;
