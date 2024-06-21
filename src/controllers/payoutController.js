const { Op } = require('sequelize');
const db = require('../config');
const Merchant = require('../models/merchants');
const Payout = require('../models/payout');
const Transaction = require('../models/transaction');
const { v4: uuidv4 } = require('uuid');

const createPayout = async (req, res) => {
  const merchantId = req.merchantId;

  try {
    // Find the merchant based on merchantId from the header token
    const merchant = await Merchant.findOne({ where: { merchantId } });
    if (!merchant) {
      return res.status(401).json({ success: false, message: 'Merchant not found' });
    }

    // Start a transaction using Sequelize
    const transaction = await db.transaction();

    try {
      // Find all pending transactions for the merchant
      const pendingTransactions = await Transaction.findAll({
        where: {
          merchantId,
          Payoutstatus: 'pending',
        },
        transaction,
      });

      if (pendingTransactions.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'No pending transactions for payout' });
      }

      // Calculate total payout amount
      let totalPayout = 0;
      for (const trans of pendingTransactions) {
        const netAmount = parseFloat(trans.transactionValue) - parseFloat(trans.fee);
        totalPayout += netAmount;
      }


      // Update merchant's account balance
      await Merchant.update(
        { accountBalance: parseFloat(merchant.accountBalance) + totalPayout },
        { where: { id: merchant.id }, transaction }
      );

      // Update payout status for each transaction
      await Transaction.update(
        { Payoutstatus: 'success' },
        { where: { id: { [Op.in]: pendingTransactions.map(t => t.id) } }, transaction }
      );

      // Create the payout record
      const newPayout = await Payout.create(
        {
          reference: uuidv4(),
          amount: totalPayout,
          businessName: merchant.businessName,
          merchantId: merchant.merchantId,
        },
        { transaction }
      );

      // Commit the transaction
      await transaction.commit();

      return res.status(200).json({ success: true, message: 'Payout created successfully', payout: newPayout });
    } catch (error) {
      // Rollback the transaction on error
      await transaction.rollback();
      console.error('Error creating payout:', error);
      return res.status(500).json({ success: false, message: 'Payout failed. Please try again later.' });
    }
  } catch (error) {
    console.error('Error in payout service:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createPayout,
};
