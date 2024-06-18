// src/models/payout.js
module.exports = (sequelize, DataTypes) => {
  const Payout = sequelize.define('Payout', {
    amount: DataTypes.FLOAT,
    fee: DataTypes.FLOAT,
  }, {});

  Payout.associate = models => {
    Payout.belongsTo(models.Merchant, { foreignKey: 'merchantId' });
  };

  return Payout;
};
