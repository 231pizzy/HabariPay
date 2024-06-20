const cron = require('node-cron');
const db = require('../src/config');
const Transaction = require('../src/models/transaction');
const TransactionFee = require('../src/models/transactionFee');
const startSettlementCronJob = require('../src/cronJobs/settlementCronJob'); // Adjust path accordingly
const { Op } = require('sequelize');

jest.mock('node-cron');
jest.mock('../src/models/transaction');
jest.mock('../src/models/transactionFee');
jest.mock('../src/config');

describe('startSettlementCronJob', () => {
  let mockTransaction;
  let mockTransactionFee;
  let transactionData;
  let transactionFeeData;

  beforeAll(() => {
    mockTransaction = {
      findAll: jest.fn(),
      save: jest.fn()
    };
    mockTransactionFee = {
      findOrCreate: jest.fn(),
      update: jest.fn()
    };

    Transaction.findAll = mockTransaction.findAll;
    Transaction.prototype.save = mockTransaction.save;
    TransactionFee.findOrCreate = mockTransactionFee.findOrCreate;
    TransactionFee.update = mockTransactionFee.update;

    startSettlementCronJob();
  });

  beforeEach(() => {
    transactionData = [
      {
        id: 1,
        status: 'pending',
        cardNumber: '1234567890123456',
        fee: 100,
        save: jest.fn()
      }
    ];

    transactionFeeData = [
      {
        id: 1,
        accountName: 'feeWallet',
        accountNumber: '0073231303',
        accountBalance: 1000,
        bankCode: '058'
      }
    ];

    jest.clearAllMocks();
  });

  it('should schedule the cron job', () => {
    expect(cron.schedule).toHaveBeenCalledWith(
      '* * * * *',
      expect.any(Function),
      { scheduled: true, timezone: 'Africa/Lagos' }
    );
  });

  it('should process pending transactions and update transaction status to success', async () => {
    mockTransaction.findAll.mockResolvedValue(transactionData);
    mockTransactionFee.findOrCreate.mockResolvedValue([transactionFeeData[0]]);
    mockTransactionFee.update.mockResolvedValue([1]);

    const cronJobFunction = cron.schedule.mock.calls[0][1];

    await cronJobFunction();

    expect(Transaction.findAll).toHaveBeenCalledWith({
      where: {
        status: 'pending',
        cardNumber: { [Op.not]: null }
      }
    });

    for (const transaction of transactionData) {
      expect(transaction.status).toBe('success');
      expect(transaction.save).toHaveBeenCalled();
    }

    expect(TransactionFee.findOrCreate).toHaveBeenCalledWith({
      where: { accountName: 'feeWallet', accountNumber: '0073231303' },
      defaults: { accountBalance: 0, bankCode: '058' },
      transaction: expect.anything()
    });

    expect(TransactionFee.update).toHaveBeenCalledWith(
      { accountBalance: parseFloat(transactionFeeData[0].accountBalance) + transactionData[0].fee },
      { where: { id: transactionFeeData[0].id }, transaction: expect.anything() }
    );
  });

  it('should handle errors during settlement processing', async () => {
    const error = new Error('Test Error');
    mockTransaction.findAll.mockRejectedValue(error);

    const cronJobFunction = cron.schedule.mock.calls[0][1];

    await cronJobFunction();

    expect(Transaction.findAll).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Error processing settlements:', error);
  });
});
