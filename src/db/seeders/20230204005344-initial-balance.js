"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Balances", [
      {
        type: "MEMBERSHIP_FEE",
        value: 1_000,
        walletId: 1,
        currencyId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: "INVESTMENT",
        value: -1_000,
        walletId: 1,
        currencyId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: "ASSET_ACQUISITION",
        value: 1_000,
        walletId: 1,
        currencyId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Balances", null, {});
  },
};
