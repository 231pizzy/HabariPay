const app = require("./src/app");
const db = require("./src/config");
const { createTestData } = require("./tests/testData");
const request = require('supertest');

let token; 

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

// function to reset database and create test data
const setup = async () => {
  try {
    jest.setTimeout(30000); 
    await db.sync({ force: true });
    console.log('Database reset successfully');
    await createTestData(); 
    await obtainAuthToken(); 
    console.log('Setup complete.');
  } catch (error) {
    console.error('Error during setup:', error);
    throw error; 
  }
};

const getToken = () => token;

module.exports = { setup, getToken };
