const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../src/app');
const db = require('../src/config'); 
const User = require('../src/models/user');
const Merchant = require('../src/models/merchants');
const startSettlementCronJob = require('../src/controllers/settlementController');
const Transaction = require('../src/models/transaction');
const TransactionFee = require('../src/models/transactionFee');

let token; 

// Function to reset database
const resetDatabase = async () => {
  try {
    await db.sync({ force: true }); 
    console.log('Database reset successfully');
  } catch (error) {
    console.error('Error resetting the database:', error);
  }
};

// Function to create test data
const createTestData = async () => {
  await Merchant.create({
    businessName: 'Test Business',
    country: 'Test Country',
    email: 'test@example.com',
    password: 'password123', // Use plain text password
    phoneNumber: '1234567890',
    merchantId: 'testMerchantId',
    accountNumber: '1234567890',
    bankCode: '058',
  });

  await User.create({
    name: 'Test User',
    email: 'testuser@example.com',
    accountBalance: 1000.0,
    accountNumber: '2233445566',
    bankCode: '058',
    transactionPin: await bcrypt.hash('1234', 10), // Hash the transaction pin
  });

};

// Obtain token once before all tests
const obtainAuthToken = async () => {
  try {
    const loginResponse = await request(app)
      .post('/habariPay/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });


    if (!loginResponse || !loginResponse.body || !loginResponse.body.token) {
      throw new Error('Failed to obtain authentication token');
    }

    token = loginResponse.body.token;

  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

beforeAll(async () => {
  jest.setTimeout(30000);
  await resetDatabase();
  await createTestData();
  await obtainAuthToken();
});

describe('Transaction Endpoints', () => {
  // Account transactions
  it('should create a transaction successfully', async () => {
    const transactionResponse = await request(app)
      .post('/habariPay/transactions/create-virtual-account-transaction')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accountNumber: '2233445566',
        value: 100,
        description: 'Test Transaction',
        currency: 'USD',
        pin: '1234',
      });

    expect(transactionResponse.status).toBe(200);
    expect(transactionResponse.body.success).toBe(true);
    expect(transactionResponse.body.transaction).toHaveProperty('reference');
    // expect(transactionResponse.body.transaction).toHaveProperty('merchantId', 'testMerchantId');
  });

  it('should return an invalid account number error', async () => {
    const transactionResponse = await request(app)
      .post('/habariPay/transactions/create-virtual-account-transaction')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accountNumber: 'invalidAccountNumber',
        value: 100,
        description: 'Test Transaction',
        currency: 'USD',
        pin: '1234',
      });

    expect(transactionResponse.status).toBe(400);
    expect(transactionResponse.body.success).toBe(false);
    expect(transactionResponse.body.message).toBe('Invalid account number');
  });

  it('should return an insufficient balance error', async () => {
    const transactionResponse = await request(app)
      .post('/habariPay/transactions/create-virtual-account-transaction')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accountNumber: '2233445566',
        value: 2000,
        description: 'Test Transaction',
        currency: 'USD',
        pin: '1234',
      });

    expect(transactionResponse.status).toBe(400);
    expect(transactionResponse.body.success).toBe(false);
    expect(transactionResponse.body.message).toBe('Insufficient balance');
  });

  // card transaction
  it('should create a card transaction successfully and set status to pending', async () => {
    const transactionResponse = await request(app)
      .post('/habariPay/transactions/create-card-transaction')
      .set('Authorization', `Bearer ${token}`)
      .send({
        value: 100,
        description: 'Test Card Transaction',
        cardNumber: '5555 5555 5555 4444',
        cardHolderName: 'Victor Anuebunwa',
        cardExpiryDate: "10-10-2024",
        cvv: '373',
        currency: 'NGN',
      });

    expect(transactionResponse.status).toBe(200);
    expect(transactionResponse.body.success).toBe(true);
    expect(transactionResponse.body.transaction).toHaveProperty('reference');
    expect(transactionResponse.body.transaction.status).toBe('pending');
  });

  it('should return an invalid card number error', async () => {
    const transactionResponse = await request(app)
      .post('/habariPay/transactions/create-card-transaction')
      .set('Authorization', `Bearer ${token}`)
      .send({
        value: 100,
        description: 'Test Card Transaction',
        cardNumber: '5555 5555 5555 444', // Invalid card number length
        cardHolderName: 'Victor Anuebunwa',
        cardExpiryDate: "10-10-2024",
        cvv: '373',
        currency: 'NGN',
      });

    expect(transactionResponse.status).toBe(400);
    expect(transactionResponse.body.success).toBe(false);
    expect(transactionResponse.body.message).toBe('Invalid card number. Card number must be 16 digits long.');
  });

  it('should return an invalid or expired card expiration date error', async () => {
    const transactionResponse = await request(app)
      .post('/habariPay/transactions/create-card-transaction')
      .set('Authorization', `Bearer ${token}`)
      .send({
        value: 100,
        description: 'Test Card Transaction',
        cardNumber: '5555 5555 5555 4444',
        cardHolderName: 'Victor Anuebunwa',
        cardExpiryDate: "02-02-2024", 
        cvv: '373',
        currency: 'NGN',
      });

    expect(transactionResponse.status).toBe(400);
    expect(transactionResponse.body.success).toBe(false);
    expect(transactionResponse.body.message).toBe('Invalid or expired card expiration date.');
  });

  it('should return an invalid CVV error', async () => {
    const transactionResponse = await request(app)
      .post('/habariPay/transactions/create-card-transaction')
      .set('Authorization', `Bearer ${token}`)
      .send({
        value: 100,
        description: 'Test Card Transaction',
        cardNumber: '5555 5555 5555 4444',
        cardHolderName: 'Victor Anuebunwa',
        cardExpiryDate: "10-10-2024",
        cvv: '37', // Invalid CVV length
        currency: 'NGN',
      });

    expect(transactionResponse.status).toBe(400);
    expect(transactionResponse.body.success).toBe(false);
    expect(transactionResponse.body.message).toBe('Invalid CVV. CVV must be 3 digits long.');
  });

  // settlement cron job
 
});

afterAll(async () => {
  try {
    await db.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing the database connection:', error);
  }
});
