require("dotenv").config();

const env = process.env.NODE_ENV.trim().toUpperCase();

module.exports = {
  username: process.env[`DB_USER_${env}`],
  password: process.env[`DB_PASSWORD_${env}`],
  database: process.env[`DB_NAME_${env}`],
  storage: process.env[`DB_NAME_${env}`],
  host: process.env[`DB_HOST_${env}`],
  port: process.env[`DB_PORT_${env}`],
  dialect: process.env[`DB_DIALECT_${env}`],
  define: {
    timestamps: true,
  },
};
