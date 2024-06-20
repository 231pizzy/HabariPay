const cron = require('node-cron');
const db = require('../src/config');
const Transaction = require('../src/models/transaction');
const TransactionFee = require('../src/models/transactionFee');
const startSettlementCronJob = require('../src/controllers/settlementController');

jest.mock('node-cron');

describe('Settlement Cron Job', () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
    await db.sync({ force: true }); // Reset the database
    // Seed necessary data for testing, similar to the createTestData function
  });

  beforeEach(() => {
    jest.clearAllMocks(); // Clear any mocked cron jobs
  });

  afterAll(async () => {
    await db.close();
  });

  it('should process pending card transactions successfully', async () => {
    const mockTransaction = {
      id: 1,
      status: 'pending',
      cardNumber: '5555 5555 5555 4444',
      fee: 10, // Example fee amount
      save: jest.fn(),
    };

    const mockTransactionFee = {
      id: 1,
      accountName: 'feeWallet',
      accountNumber: '0073231303',
      bankCode: '058',
      accountBalance: 0,
      update: jest.fn(),
      findOrCreate: jest.fn(() => [mockTransactionFee, false]), // Simulate existing record
    };

    // Mock finding pending transactions
    Transaction.findAll.mockResolvedValue([mockTransaction]);

    // Mock transaction fee operations
    TransactionFee.findOrCreate.mockResolvedValue([mockTransactionFee]);

    // Mock transaction update operations
    mockTransaction.save.mockResolvedValue();

    // Run the settlement cron job function
    startSettlementCronJob();

    // Fast-forward time to trigger the cron job
    jest.runOnlyPendingTimers();

    // Assert that transaction status is updated
    expect(mockTransaction.save).toHaveBeenCalledWith(expect.any(Object));
    expect(mockTransaction.status).toBe('success');

    // Assert that transaction fee is updated
    expect(TransactionFee.update).toHaveBeenCalledWith(
      { accountBalance: mockTransactionFee.accountBalance + mockTransaction.fee },
      { where: { id: mockTransactionFee.id } }
    );
  });

  // Add more test cases to cover edge cases and errors if needed
});
