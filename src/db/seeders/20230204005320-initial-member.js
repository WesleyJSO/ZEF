"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Members", [
      {
        name: "ZEF INC.",
        document: "XX.XXX.XXX/XXXX-XX",
        type: "DOMAIN_OWNER",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Members", null, {});
  },
};
