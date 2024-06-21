const request = require('supertest');
const app = require('../src/app');
const { getToken, setup } = require('../jest.setup');
const db = require('../src/config');

let token;

beforeAll(async () => {
  jest.setTimeout(30000);
  await setup();
  token = getToken(); 
});

describe('Transaction Endpoints', () => {
  
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
        cardNumber: '5555 5555 5555 444',
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
        cvv: '37', 
        currency: 'NGN',
      });

    expect(transactionResponse.status).toBe(400);
    expect(transactionResponse.body.success).toBe(false);
    expect(transactionResponse.body.message).toBe('Invalid CVV. CVV must be 3 digits long.');
  }); 

  // payout
  it('should create a payout successfully', async () => {
    const payoutResponse = await request(app)
      .post('/habariPay/payout/create-payout')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(payoutResponse.status).toBe(200);
    expect(payoutResponse.body.success).toBe(true);
    expect(payoutResponse.body.payout).toHaveProperty('reference');
  });

    it('should return merchant not found error', async () => {
    const invalidToken = 'invalidToken';

    const payoutResponse = await request(app)
      .post('/habariPay/payout/create-payout')
      .set('Authorization', `Bearer ${invalidToken}`)
      .send();

    expect(payoutResponse.status).toBe(401);
    expect(payoutResponse.body.success).toBe(false);
    expect(payoutResponse.body.message).toBe('Invalid token');
  });
});

afterAll(async () => {
  try {
    jest.clearAllTimers();
    await db.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing the database connection:', error);
  }
});