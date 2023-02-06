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
      model: models.sequelize.models.Wallet,
      where: { memberId: memberId },
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
      statusCode: 400,
      message:
        "Member id informed is invalid, the user must be registered for this operation!",
    };
  }
  if (!member.Wallet) {
    return {
      statusCode: 400,
      message:
        "Member doesn't have a wallet, it's possible that an error occoured during registration!",
    };
  }
};

const validateInvestment = (
  investorId,
  projectInvestedId,
  investedValue,
  transactionType
) => {
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
  if (!transactionType) {
    return { statusCode: 400, message: "Type should be informed!" };
  }
};

const makeAnInvestment = async ({
  investorId,
  projectInvestedId,
  investedValue,
  transactionType,
}) => {
  const invalidParameters = validateInvestment(
    investorId,
    projectInvestedId,
    investedValue,
    transactionType
  );
  if (invalidParameters) {
    return invalidParameters;
  }

  const investor = await memberRepository.findOne({
    where: { id: investorId },
    include: models.sequelize.models.Wallet,
  });
  if (!investor) {
    return {
      reasonCode: 404,
      message: "Member couldn't be found, invalid member id!",
    };
  }

  const { message: kunaBalance } = await balanceService.getCroatinaKunaBalance({
    memberId: investor.id,
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

  const croatinaKuna = await currencyRepository.findOne({
    where: { name: "Croatian kuna" },
  });

  const transaction = await models.sequelize.transaction();
  try {
    // debit Croatian kuna(ZKN) value from investor
    await balanceRepository.create({
      type: "INVESTMENT",
      value: investedValue * -1,
      currencyId: croatinaKuna.id,
      walletId: investor.Wallet.id,
    });

    // increase value invested in project
    const projectInvested = await projectRepository.findOne({
      where: { id: projectInvestedId },
      include: models.sequelize.models.Currency,
    });
    if (!projectInvested) {
      throw new Error("Invalid project id!");
    }
    projectInvested.value += investedValue;
    await projectRepository.update(
      { value: projectInvested.value },
      { where: { id: projectInvested.id } }
    );

    // credit project currency value to investor
    // (project value / currency amount) * my amount ZNK
    const calculatedDigitalAmount =
      (projectInvested.value / projectInvested.Currency.amount) * investedValue;

    const credit = await balanceRepository.create({
      type: transactionType, // MEMBERSHIP_FEE | ASSET_ACQUISITION
      value: calculatedDigitalAmount,
      walletId: investor.Wallet.id,
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

module.exports = {
  payMembershipFee: async ({ value, memberId }) => {
    const invalid = validateMembershipFee(value, memberId);
    if (invalid) {
      return invalid;
    }
    const membershipPaid = await isMembershipAlreadyPaid(memberId);
    if (membershipPaid) {
      return membershipPaid;
    }
    const member = await memberRepository.findOne({
      where: { id: memberId },
      include: models.sequelize.models.Wallet,
    });
    const invalidMember = validateMember(member);
    if (invalidMember) {
      return invalidMember;
    }
    const project = await projectRepository.findOne({ where: { name: "ZEF" } });
    return await makeAnInvestment({
      investorId: member.id,
      projectInvestedId: project.id,
      investedValue: value,
      transactionType: "MEMBERSHIP_FEE",
    });
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
  croatianKunaDeposity: async ({ investorId, depositValue }) => {
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
          "Deposit value should be informed and should be greather than 0!",
      };
    }
    const investor = await memberRepository.findOne({
      where: { id: investorId },
      include: models.sequelize.models.Wallet,
    });
    if (!investor) {
      return {
        statusCode: 404,
        message: "Member not found, a valid member id should be informed!",
      };
    }

    const croatinaKuna = await currencyRepository.findOne({
      where: { name: "Croatian kuna" },
    });

    const deposit = await balanceRepository.create({
      type: "DEPOSIT",
      value: depositValue,
      currencyId: croatinaKuna.id,
      walletId: investor.Wallet.id,
    });
    return { statusCode: 201, message: deposit };
  },
};
