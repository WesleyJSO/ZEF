const { Sequelize } = require("sequelize");
const config = require("./config.js");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    dialect: config.dialect,
    port: config.port,
    storage: config.storage,
  },
  config.define
);

module.exports = sequelize;
