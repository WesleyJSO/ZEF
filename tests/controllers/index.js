const models = require("../../src/models/index.js");

const balanceRepository = models.sequelize.models.Balance;
const currencyRepository = models.sequelize.models.Currency;
const memberRepository = models.sequelize.models.Member;
const projectRepository = models.sequelize.models.Project;
const walletRepository = models.sequelize.models.Wallet;

module.exports = {
  balanceRepository,
  initialize: async () => {
    await balanceRepository.destroy({ truncate: { cascade: true } });
    await currencyRepository.destroy({ truncate: { cascade: true } });
    await memberRepository.destroy({ truncate: { cascade: true } });
    await projectRepository.destroy({ truncate: { cascade: true } });
    await walletRepository.destroy({ truncate: { cascade: true } });

    await memberRepository.create({
      id: 1,
      name: "ZEF INC.",
      document: "XX.XXX.XXX/XXXX-XX",
      type: "DOMAIN_OWNER",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await projectRepository.create({
      id: 1,
      name: "ZEF",
      value: 1_000,
      memberId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await currencyRepository.bulkCreate([
      {
        id: 1,
        name: "ZEF kuna",
        alias: "ZKN",
        type: "DIGITAL",
        amount: 1_000_000,
        quotation: 1,
        anchorCurrencyId: 2,
        projectId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "Croatian kuna",
        alias: "HRK",
        type: "FIAT",
        amount: 1_000_000,
        quotation: 1,
        projectId: null,
        anchorCurrencyId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await walletRepository.create({
      id: 1,
      name: "ZEF Wallet",
      memberId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  },
};
