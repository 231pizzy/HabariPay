// // src/config/dbconfig.js
// const { Sequelize } = require("sequelize");
// const dotenv = require("dotenv");
// const mergedConfig = require("./dbConfig");


// dotenv.config();

// const { PORT, DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD } = mergedConfig;

// const db = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD,
//   {
//     host: DB_HOST,
//     port: PORT,
//     dialect: "postgres",
//     logging: false,
//     dialectOptions: {
//       encrypt: true,
//       ssl: false,
//     },
//   }
// );

// module.exports = db;
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const mergedConfig = require('./dbConfig');

dotenv.config();

const { DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_PORT } = mergedConfig;

const db = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false,
  },
});

module.exports = db;
