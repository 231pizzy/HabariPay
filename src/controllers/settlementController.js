const cron = require('node-cron');
const db = require('../config');
const { Op } = require('sequelize');
const Transaction = require('../models/transaction');
const TransactionFee = require('../models/transactionFee');

const startSettlementCronJob = () => {
    cron.schedule('* * * * *', async () => {
      console.log("Cron job started at", new Date().toISOString());
  
      try {
        console.log('Starting settlement processing...');
  
        // Query pending card transactions from the database
        const pendingTransactions = await Transaction.findAll({
          where: {
            status: 'pending',
            cardNumber: { [Op.not]: null }
          }
        });
  
        // Process settlement for each pending card transaction
        await db.transaction(async (t) => {
          for (const transaction of pendingTransactions) {
            // Update transaction status to success
            transaction.status = 'success';
            await transaction.save({ transaction: t });
  
            // Find or create the TransactionFee record (feeWallet)
            const [transactionFee] = await TransactionFee.findOrCreate({
              where: { accountName: 'feeWallet', accountNumber: '0073231303' },
              defaults: { accountBalance: 0, bankCode: '058' },
              transaction: t
            });
  
            // Update TransactionFee account balance with fee amount
            await TransactionFee.update(
              { accountBalance: parseFloat(transactionFee.accountBalance) + transaction.fee },
              { where: { id: transactionFee.id }, transaction: t }
            );
          }
        });
  
        console.log('Settlement processing complete.');
      } catch (error) {
        console.error('Error processing settlements:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Africa/Lagos'
    });
  
    console.log('Cron job scheduled successfully.');
  };
  
  module.exports = startSettlementCronJob;