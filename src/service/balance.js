const models = require("../models/index.js");

const repository = models.sequelize.models.Balance;
const memberRepository = models.sequelize.models.Member;
const balanceRepository = models.sequelize.models.Balance;

const groupBalancesByCurrency = (balances) => {
  const grouped = {};
  balances
    .map((balance) => balance.dataValues)
    .forEach((balance) => {
      if (!grouped[balance.Currency.alias]) {
        grouped[balance.Currency.alias] = {
          currency: balance.Currency.name,
          amount: balance.value,
          price: balance.Currency.quotation,
          croatianKunaQuotation: 1.0,
        };
      } else {
        grouped[balance.Currency.alias].amount += balance.value;
      }
    });

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
      model: models.sequelize.models.Balance,
      include: {
        model: models.sequelize.models.Currency,
        where: { id: currencyId },
      },
    },
  });

  if (!member) {
    return {
      statusCode: 404,
      message: "Member couldn't be found, invalid member id!",
    };
  }
  const grouped = groupBalancesByCurrency(member.Balances);

  return { statusCode: 200, message: grouped };
};

const convertToNewCurrency = async (currencyId, memberId, withdrawAmount) => {
  const balances = balanceRepository.findAll({
    where: { currencyId, memberId },
  });
  return balances;
};

module.exports = {
  convertToNewCurrency,
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
        statusCode: 401,
        message: "Member informed is not an administrator!",
      };
    }
    const balances = await repository.findAll({
      include: models.sequelize.models.Currency,
    });
    const grouped = groupBalancesByCurrency(balances);
    return { statusCode: 200, message: grouped };
  },

  getAllBalance: async ({ memberId }) => {
    if (!memberId) {
      return { statusCode: 400, message: "Member id should be informed!" };
    }
    const member = await memberRepository.findOne({
      where: { id: memberId },
      include: {
        model: models.sequelize.models.Balance,
        include: {
          model: models.sequelize.models.Currency,
        },
      },
    });
    if (!member) {
      return {
        statusCode: 404,
        message: "Member couldn't be found, invalid member id!",
      };
    }
    const grouped = groupBalancesByCurrency(member.Balances);

    return { statusCode: 200, message: grouped };
  },
  getDetailedBalance: async ({ memberId, currencyId }) => {
    const invalid = validateParameters(memberId, currencyId);
    if (invalid) {
      return invalid;
    }
    const balances = await balanceRepository.findAll({
      where: { currencyId, memberId },
      include: {
        model: models.sequelize.models.Currency,
      },
    });
    let balanceAmount = 0;
    balances.forEach((balance) => {
      balanceAmount += balance.value;
      balance.dataValues.currencyName = balance.dataValues.Currency.name;
      delete balance.dataValues.id;
      delete balance.dataValues.memberId;
      delete balance.dataValues.currencyId;
      delete balance.dataValues.updatedAt;
      delete balance.dataValues.Currency;
      return balance;
    });
    return { statusCode: 200, message: { balances, balanceAmount } };
  },
};
