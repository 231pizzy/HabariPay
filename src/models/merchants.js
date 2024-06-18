// src/models/merchant.js
module.exports = (sequelize, DataTypes) => {
    const Merchant = sequelize.define('Merchant', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bankCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // Add more fields as needed (e.g., email, contact number, address)
    }, {});
  
    Merchant.associate = models => {
      Merchant.hasMany(models.Transaction, { foreignKey: 'merchantId' });
      // Define any other associations needed, e.g., payouts
    };
  
    return Merchant;
  };
  