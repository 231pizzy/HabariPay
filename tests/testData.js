const bcrypt = require('bcrypt');
const Merchant = require('../src/models/merchants');
const User = require('../src/models/user');

const createTestData = async () => {

  await Merchant.create({
    businessName: 'Test Business',
    country: 'Test Country',
    email: 'test@example.com',
    password: 'password123', 
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
    transactionPin: await bcrypt.hash('1234', 10), 
  });

};

module.exports = { createTestData };
