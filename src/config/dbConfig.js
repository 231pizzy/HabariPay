// src/config/dbconfig.js
const merge = require('lodash.merge');
const dotenv = require("dotenv");
dotenv.config();

const stage = process.env.NODE_ENV;
console.log("stage:", stage);

let config;

if (stage === "production") {
  config = require("./prod");
} else if (stage === "development") {
  config = require("./dev");
}  else if (stage === "test") {
  config = require("./testdb");
}else {
  config = {};
}

const mergedConfig = merge({ stage }, config);


module.exports = mergedConfig;
