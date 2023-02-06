const models = require("../models/index.js");
const balanceService = require("../service/balance.js");

const repository = models.sequelize.models.Currency;
const balanceRepository = models.sequelize.models.Balance;

module.exports = {
  findAll: async () => {
    const currencies = await repository.findAll();
    const groupedBalanceSumary =
      await balanceService.getSumaryOfCurrencyValues();
    return {
      statusCode: 200,
      message: groupedBalanceSumary,
    };
  },
};
