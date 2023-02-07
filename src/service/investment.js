const models = require("../models/index.js");
const balanceService = require("./balance.js");

const projectRepository = models.sequelize.models.Project;
const balanceRepository = models.sequelize.models.Balance;
const memberRepository = models.sequelize.models.Member;
const currencyRepository = models.sequelize.models.Currency;

/**
 * Make an investment transaction for a member
 * @param {investorId} Member making the investment
 * @param {projectInvestedId} Project that will receive the money in it's currency and a increase in its value
 * @param {investedValue} double value to ve invested if the investor has the money(HRK) available to complete the transaction
 * @param {transactionType} enum value that can be one of the following options "DEPOSIT", "ASSET_SALE", "WITHDRAW", "MEMBERSHIP_FEE"
 * @returns object with the value credited on the member account
 */

const isMembershipAlreadyPaid = async (memberId) => {
  const paidMembershipFee = await balanceRepository.findOne({
    where: { type: "MEMBERSHIP_FEE" },
    include: {
      model: models.sequelize.models.Member,
      where: { id: memberId },
    },
  });
  if (paidMembershipFee) {
    return {
      statusCode: 409,
      message: "Membership fee already paid!",
    };
  }
};

const validateMembershipFee = (value, memberId) => {
  if (!memberId) {
    return { statusCode: 400, message: "Member id should be informed!" };
  }
  if (!value || isNaN(value) || value <= 0) {
    return {
      statusCode: 400,
      message: "Value must be informed and should be greather than 0.0!",
    };
  }
};

const validateMember = (member) => {
  if (!member) {
    return {
      statusCode: 404,
      message: "Member couldn't be found, invalid member id!",
    };
  }
};

const validateInvestment = (investorId, projectInvestedId, investedValue) => {
  if (!investorId) {
    return { statusCode: 400, message: "Member id should be informed!" };
  }
  if (!projectInvestedId) {
    return { statusCode: 400, message: "Project id should be informed!" };
  }
  if (!investedValue || isNaN(investedValue) || investedValue <= 0) {
    return {
      statusCode: 400,
      message:
        "Value invested should be informed and should be greather than 0!",
    };
  }
};

const makeAnInvestment = async ({
  investorId,
  projectInvestedId,
  investedValue,
}) => {
  const invalidParameters = validateInvestment(
    investorId,
    projectInvestedId,
    investedValue
  );
  if (invalidParameters) {
    return invalidParameters;
  }

  const investor = await memberRepository.findByPk(investorId);
  if (!investor) {
    return {
      statusCode: 404,
      message: "Member couldn't be found, invalid member id!",
    };
  }

  const croatinaKuna = await currencyRepository.findOne({
    where: { name: "Croatian kuna" },
  });

  // increase value invested in project
  const projectInvested = await projectRepository.findOne({
    where: { id: projectInvestedId },
    include: models.sequelize.models.Currency,
  });
  if (!projectInvested) {
    throw new Error(
      "Project not found, a valid project id should be informed!"
    );
  }

  const { message: kunaBalance } =
    await balanceService.getMemberCurrencyBalance({
      memberId: investor.id,
      currencyId: croatinaKuna.id,
    });
  if (
    !kunaBalance.HRK ||
    !kunaBalance.HRK.amount ||
    kunaBalance.HRK.amount < investedValue
  ) {
    return {
      statusCode: 409,
      message: "Insuficient amount of Kuna to invest!",
    };
  }

  const transaction = await models.sequelize.transaction();
  try {
    // debit Croatian kuna(ZKN) value from investor
    await balanceRepository.create({
      type: "INVESTMENT",
      value: investedValue * -1,
      currencyId: croatinaKuna.id,
      memberId: investor.id,
    });

    projectInvested.value += investedValue;
    await projectRepository.update(
      { value: projectInvested.value },
      { where: { id: projectInvested.id } }
    );

    // credit project currency value to investor
    // (project value / currency amount) * my amount ZNK
    const quotation = projectInvested.value / projectInvested.Currency.amount;
    const calculatedDigitalAmount = investedValue / quotation;

    await currencyRepository.update(
      { quotation },
      { where: { id: projectInvested.Currency.id } }
    );
    const credit = await balanceRepository.create({
      type: "ASSET_ACQUISITION",
      value: calculatedDigitalAmount,
      memberId: investor.id,
      currencyId: projectInvested.Currency.id,
    });

    await transaction.commit();
    return { statusCode: 201, message: credit };
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    return {
      statusCode: 500,
      message: `Error during investment transaction: ${error.message}`,
    };
  }
};

const croatianKunaDeposity = async ({ investorId, depositValue }) => {
  if (!investorId) {
    return {
      statusCode: 400,
      message: "Member id shoud be informed!",
    };
  }
  if (!depositValue || isNaN(depositValue) || depositValue <= 0) {
    return {
      statusCode: 400,
      message:
        "Deposit value should be informed and should be greather than 0.0!",
    };
  }
  const investor = await memberRepository.findByPk(investorId);
  if (!investor) {
    return {
      statusCode: 404,
      message: "Member couldn't be found, invalid member id!",
    };
  }

  const croatinaKuna = await currencyRepository.findOne({
    where: { name: "Croatian kuna" },
  });

  const deposit = await balanceRepository.create({
    type: "DEPOSIT",
    value: depositValue,
    currencyId: croatinaKuna.id,
    memberId: investor.id,
  });
  return { statusCode: 201, message: deposit };
};

module.exports = {
  returnCurrency: async ({
    currencyId,
    memberid: memberId,
    amount: withdrawAmount,
  }) => {
    if (!currencyId) {
      return { statusCode: 404, message: "Invalid currency id!" };
    }
    if (!memberId) {
      return { statusCode: 404, message: "Invalid member id!" };
    }
    if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return {
        statusCode: 400,
        message: "Amount issued should be informed and be higher than 0.0!",
      };
    }

    const member = await memberRepository.findByPk(memberId);
    if (!member || member === "DOMAIN_OWNER") {
      return {
        statusCode: 422,
        message: "Member id shouldn't be from a domain owner!",
      };
    }
    const currencyToWithdraw = await currencyRepository.findByPk(currencyId);
    if (!currencyToWithdraw || currencyToWithdraw.type === "FIAT") {
      return {
        statusCode: 422,
        message: "Currency id should be valid and from a digital currency!",
      };
    }
    const { message: currencyAmount } =
      await balanceService.getMemberCurrencyBalance({
        memberId,
        currencyId,
      });
    if (
      withdrawAmount > currencyAmount[Object.keys(currencyAmount)[0]].amount
    ) {
      return {
        statusCode: 409,
        message: "Insuficient funds!",
      };
    }

    const transaction = await models.sequelize.transaction();
    try {
      const zkn = await currencyRepository.findOne({
        where: { name: "ZEF kuna" },
      });
      const hrk = await currencyRepository.findOne({
        where: { name: "Croatian kuna" },
      });

      await balanceRepository.create({
        type: "ASSET_SALE",
        value: withdrawAmount * -1,
        memberId,
        currencyId,
      });

      const project = await projectRepository.findByPk(
        currencyToWithdraw.projectId
      );

      if (zkn.id != currencyId) {
        const amountConvertedToZKN = await balanceService.convertToNewCurrency(
          zkn.id,
          memberId,
          withdrawAmount
        );
        await balanceRepository.create({
          type: "ASSET_ACQUISITION",
          value: amountConvertedToZKN,
          memberId,
          currencyId: zkn.id,
        });
        await balanceRepository.create({
          type: "ASSET_SALE",
          value: amountConvertedToZKN * -1,
          memberId,
          currencyId: zkn.id,
        });
      }

      const amountConvertedToHRK =
        withdrawAmount * currencyToWithdraw.quotation;

      project.value -= amountConvertedToHRK;
      await projectRepository.update(
        { value: project.value },
        { where: { id: project.id } }
      );

      await balanceRepository.create({
        type: "ASSET_ACQUISITION",
        value: amountConvertedToHRK,
        memberId,
        currencyId: hrk.id,
      });

      currencyToWithdraw.quotation = project.value / currencyToWithdraw.amount;
      await currencyRepository.update(
        { quotation: currencyToWithdraw.quotation },
        { where: { id: currencyToWithdraw.id } }
      );

      const withdraw = await balanceRepository.create({
        type: "WITHDRAW",
        value: amountConvertedToHRK * -1,
        memberId,
        currencyId: hrk.id,
      });

      await transaction.commit();
      return { statusCode: 201, message: withdraw };
    } catch (error) {
      await transaction.rollback();
      return {
        statusCode: 500,
        message: `Error during investment transaction: ${error.message}`,
      };
    }
  },
  payMembershipFee: async ({ value, memberId }) => {
    const invalid = validateMembershipFee(value, memberId);
    if (invalid) {
      return invalid;
    }
    const membershipPaid = await isMembershipAlreadyPaid(memberId);
    if (membershipPaid) {
      return membershipPaid;
    }
    const member = await memberRepository.findByPk(memberId);
    const invalidMember = validateMember(member);
    if (invalidMember) {
      return invalidMember;
    }
    const project = await projectRepository.findOne({ where: { name: "ZEF" } });
    const croatinaKuna = await currencyRepository.findOne({
      where: { name: "Croatian kuna" },
    });
    await balanceRepository.create({
      type: "MEMBERSHIP_FEE",
      value,
      currencyId: croatinaKuna.id,
      memberId: member.id,
    });
    await makeAnInvestment({
      investorId: member.id,
      projectInvestedId: project.id,
      investedValue: value,
      transactionType: "ASSET_ACQUISITION",
    });

    return { statusCode: 204 };
  },
  makeAnInvestment,

  /**
   * Croatina kuna will be treated as an external currency,
   * the users can deposit an infinite amount of it,
   * only this currency will allow them to invest in other currencies.
   *
   * @param {investorId} Member id to attach to the balance
   * @param {depositValue} double value to be credited in the form of Croatian Kuna(HRK)
   * @returns balance deposit
   */
  croatianKunaDeposity,
};
