const dotenv = require("dotenv");
dotenv.config();

const { TEST_PORT, TEST_DB_NAME, TEST_DB_HOST, TEST_DB_USERNAME, TEST_DB_PASSWORD } = process.env;

module.exports = {
  PORT: TEST_PORT,
  DB_NAME: TEST_DB_NAME,
  DB_HOST: TEST_DB_HOST,
  DB_USERNAME: TEST_DB_USERNAME,
  DB_PASSWORD: TEST_DB_PASSWORD,
};

console.log("running in test mode");
