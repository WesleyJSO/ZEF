const models = require("../models/index.js");

const repository = models.sequelize.models.Balance;
const memberRepository = models.sequelize.models.Member;
const currencyRepository = models.sequelize.models.Currency;

const groupBalancesByCurrency = (balances) => {
  const grouped = {};
  balances
    .map((balance) => balance.dataValues)
    .forEach((balance) => {
      if (!grouped[balance.Currency.alias]) {
        grouped[balance.Currency.alias] = {
          currency: balance.Currency.name,
          amount: balance.value,
          price: 0.0,
          croatianKunaQuotation: 1,
        };
      } else {
        grouped[balance.Currency.alias].amount += balance.value;
      }
    });
  for (key of Object.keys(grouped)) {
    grouped[key].price = parseFloat(
      (grouped[key].croatianKunaQuotation * grouped[key].amount).toFixed(2)
    );
  }
  return grouped;
};

const validateParameters = (memberId, currencyId) => {
  if (!memberId) {
    return { statusCode: 400, message: "Member id should be informed!" };
  }
  if (!currencyId) {
    return { statusCode: 400, message: "Currency id should be informed!" };
  }
};
const getMemberCurrencyBalance = async ({ memberId, currencyId }) => {
  const invalid = validateParameters(memberId, currencyId);
  if (invalid) {
    return invalid;
  }

  const member = await memberRepository.findOne({
    where: { id: memberId },
    include: {
      model: models.sequelize.models.Wallet,
      include: {
        model: models.sequelize.models.Balance,
        include: {
          model: models.sequelize.models.Currency,
          where: { id: currencyId },
        },
      },
    },
  });

  if (!member) {
    return { statusCode: 404, message: "Invalid member id!" };
  }
  const grouped = groupBalancesByCurrency(member.Wallet.Balances);

  return { statusCode: 200, message: grouped };
};

module.exports = {
  getMemberCurrencyBalance,
  getSumaryOfCurrencyValues: async ({ memberid: memberId }) => {
    if (!memberId) {
      return {
        statusCode: 400,
        message: "Invalid request, missing MemberId header!",
      };
    }
    const member = await memberRepository.findByPk(memberId);
    if (!member || member.type !== "DOMAIN_OWNER") {
      return {
        statusCode: 400,
        message: "Member informed is not an administrator!",
      };
    }
    const balances = await repository.findAll({
      include: models.sequelize.models.Currency,
    });
    const grouped = groupBalancesByCurrency(balances);
    return { statusCode: 200, message: grouped };
  },

  getCroatinaKunaBalance: async ({ memberId }) => {
    const croatinaKuna = await currencyRepository.findOne({
      where: { name: "Croatian kuna" },
    });
    return await getMemberCurrencyBalance({
      memberId,
      currencyId: croatinaKuna.id,
    });
  },
};
