const supertest = require('supertest');
const httpStatus = require('http-status');

const app = require('../src/app');
const request = supertest(app);

describe('Basic', () => {
  test('Mic check', async () => {
    const response = await request.get('/v1/').send();

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body.message).toBe('It Works');
  });

});
