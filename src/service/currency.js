const models = require("../models/index.js");
const balanceService = require("../service/balance.js");

const repository = models.sequelize.models.Currency;
const memberRepository = models.sequelize.models.Member;

const validateParameters = (currencyId, domainOwnerId, issueAmount) => {
  if (!currencyId) {
    return { statusCode: 400, message: "Currency id should be informed!" };
  }
  if (!domainOwnerId) {
    return { statusCode: 400, message: "Member id should be informed!" };
  }
  if (!issueAmount || isNaN(issueAmount) || issueAmount <= 0) {
    return {
      statusCode: 400,
      message: "Amount issued should be informed and be higher than 0.0!",
    };
  }
};

module.exports = {
  issueCurrency: async ({
    currencyId,
    domainownerid: domainOwnerId,
    amount: issueAmount,
  }) => {
    const invalid = validateParameters(currencyId, domainOwnerId, issueAmount);
    if (invalid) {
      return invalid;
    }
    const domainOwner = await memberRepository.findByPk(domainOwnerId);
    if (!domainOwner || domainOwner.type !== "DOMAIN_OWNER") {
      return {
        statusCode: 404,
        message: "Member informed is not an domain owner!",
      };
    }
    const projectCurrency = await repository.findOne({
      where: { id: currencyId, type: "DIGITAL" },
      include: { model: models.sequelize.models.Project },
    });
    if (!projectCurrency) {
      return {
        statusCode: 404,
        message: "Invalid currency id informed!",
      };
    }
    projectCurrency.amount += issueAmount;
    projectCurrency.quotation =
      projectCurrency.Project.value / projectCurrency.amount;

    await repository.update(
      { amount: projectCurrency.amount, quotation: projectCurrency.quotation },
      { where: { id: projectCurrency.id } }
    );

    return {
      statusCode: 200,
      message: projectCurrency,
    };
  },
};
