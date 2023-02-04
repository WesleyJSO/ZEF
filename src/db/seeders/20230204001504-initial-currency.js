"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Currencies", [
      {
        name: "ZEF kuna",
        alias: "ZKN",
        type: "DIGITAL",
        anchorCurrencyId: 2,
        projectId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Croatian kuna",
        alias: "HRK",
        type: "FIAT",
        projectId: null,
        anchorCurrencyId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Currencies", null, {});
  },
};
