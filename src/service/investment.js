const models = require("../models/index.js");
const balanceService = require("./balance.js");

const projectRepository = models.sequelize.models.Project;
const balanceRepository = models.sequelize.models.Balance;
const memberRepository = models.sequelize.models.Member;
const currencyRepository = models.sequelize.models.Currency;

// Cintia make an investmenta and buys from wesley project
// deposit +100BRL
// ZEF kuna +100BTC

// wesley sold
// received +100BRL
// ZEF kuna -100BTC

const makeAnInvestment = async ({
  investorId,
  projectInvestedId,
  valueInvested,
  transactionType,
}) => {
  const investor = await memberRepository.findOne({
    where: { id: investorId },
    include: models.sequelize.models.Wallet,
  });

  //check if investment is being made in Croatian Kuna, in this case allow investment without checking balance
  // check if investor has valid amount of kuna to make the investment
  const { message: kunaBalance } = await balanceService.getCroatinaKunaBalance({
    memberId: investor.id,
  });
  if (
    !kunaBalance.HRK ||
    !kunaBalance.HRK.amount ||
    kunaBalance.HRK.amount < valueInvested
  ) {
    return {
      statusCode: 400,
      message: "Insuficient amount of Kuna to invest!",
    };
  }

  const zefKuna = await currencyRepository.findOne({
    where: { name: "ZEF kuna" },
  });

  const transaction = await models.sequelize.transaction();
  try {
    // debit ZKN value from investor
    await balanceRepository.create({
      type: "WITHDRAW",
      value: valueInvested * -1,
      currencyId: zefKuna.id,
      walletId: investor.Wallet.id,
    });

    // increase value invested project
    const projectInvested = await projectRepository.findOne({
      where: { id: projectInvestedId },
      include: models.sequelize.models.Currency,
    });
    projectInvested.value += valueInvested;
    await projectRepository.update(
      { value: projectInvested.value },
      { where: { id: projectInvested.id } }
    );

    // credit project currency value to investor
    const credit = await balanceRepository.create({
      type: transactionType, // MEMBERSHIP_FEE || DEPOSIT
      value: valueInvested,
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
    if (!memberId) {
      return { statusCode: 400, message: "Member id should be informed!" };
    }
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
    if (!value || isNaN(value) || value <= 0) {
      return {
        statusCode: 400,
        message: "Value must be informed and should be greather than 0.0!",
      };
    }

    const member = await memberRepository.findOne({
      where: { id: memberId },
      include: models.sequelize.models.Wallet,
    });
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

    const project = await projectRepository.findOne({ where: { name: "ZEF" } });
    return await makeAnInvestment({
      investorId: member.id,
      projectInvestedId: project.id,
      valueInvested: value,
      transactionType: "MEMBERSHIP_FEE",
    });
  },
  makeAnInvestment,
  /* Croatina kuna will be treated as a infinite currency,
   * the users can deposit an infinite amount of it,
   * only this currency will allow them to invest in other currencies.
   */
  investInCroatianKuna: async ({ investorId, valueInvested }) => {
    const investor = await memberRepository.findOne({
      where: { id: investorId },
      include: models.sequelize.models.Wallet,
    });

    const croatinaKuna = await currencyRepository.findOne({
      where: { name: "Croatian kuna" },
    });
    const deposit = await balanceRepository.create({
      type: "DEPOSIT",
      value: valueInvested,
      currencyId: croatinaKuna.id,
      walletId: investor.Wallet.id,
    });
    return { statusCode: 201, message: deposit };
  },
  // sellInvestment: async ({ memberId, projectId, sellingAmount }) => {
  //   const project = await projectRepository.findOne({
  //     where: { id: projectId },
  //     include: models.sequelize.models.Currency,
  //   });

  //   const { message: memberProjectCurrencyBalance } =
  //     await balanceService.getMemberCurrencyBalance({
  //       memberId,
  //       currencyId: project.Currency.id,
  //     });
  //   if (
  //     !memberProjectCurrencyBalance ||
  //     !memberProjectCurrencyBalance[project.Currency.alias] ||
  //     !memberProjectCurrencyBalance[project.Currency.alias].amount ||
  //     sellingAmount >
  //       memberProjectCurrencyBalance[project.Currency.alias].amount
  //   ) {
  //     return { statusCode: 400, message: "Insuficient funds!" };
  //   }
  //   project.value -= sellingAmount;

  //   const transaction = await models.sequelize.transaction();
  //   try {
  //     projectRepository.update(
  //       { value: project.value },
  //       { where: { id: project.id } }
  //     );

  //     const croatinaKuna = await currencyRepository.findOne({
  //       where: { name: "Croatian kuna" },
  //     });

  //     const investor = await memberRepository.findOne({
  //       where: { id: memberId },
  //       include: models.sequelize.models.Wallet,
  //     });

  //     // const currencyValue =
  //     //   (project.value / project.Currency.amount) *
  //     //   memberProjectCurrencyBalance[project.Currency.alias].amount;

  //     const balance = await balanceRepository.create({
  //       type: "ASSET_SALE",
  //       value: sellingAmount,
  //       currencyId: project.Currency.id,
  //       walletId: investor.Wallet.id,
  //     });
  //     await transaction.commit();
  //     return { responseCode: 201, message: balance };
  //   } catch (error) {
  //     console.error(error);
  //     await transaction.rollback();
  //     return {
  //       statusCode: 500,
  //       message: `Error during investment transaction: ${error.message}`,
  //     };
  //   }
  // },
};
