const models = require("../models/index.js");

const repository = models.sequelize.models.Member;
const walletRepository = models.sequelize.models.Wallet;

const validateParameters = (name, document, type) => {
  if (!name || !name.trim()) {
    return { statusCode: 400, message: "Name should be informed!" };
  }
  if (!document || !document.trim()) {
    return { statusCode: 400, message: "Document should be informed!" };
  }
  if (!type || !["DOMAIN_OWNER", "COMPANY", "INDIVIDUAL"].includes(type)) {
    return {
      statusCode: 400,
      message:
        "Member type should be informed (DOMAIN_OWNER, COMPANY, INDIVIDUAL)!",
    };
  }
};

module.exports = {
  create: async ({ name, document, type }) => {
    const invalid = validateParameters(name, document, type);
    if (invalid) {
      return invalid;
    }

    const member = await repository.findOne({ where: { document } });
    if (member) {
      return {
        statusCode: 409,
        message: `A member with the document ${document} already exists!`,
      };
    }

    const transaction = await models.sequelize.transaction();
    try {
      const memberCreated = await repository.create(
        {
          name,
          document,
          type,
        },
        { transaction }
      );

      await walletRepository.create(
        {
          name: `${name}'s wallet`,
          memberId: memberCreated.id,
        },
        { transaction }
      );
      await transaction.commit();
      await memberCreated.getWallet();

      return { statusCode: 201, message: memberCreated };
    } catch (error) {
      console.error(error);
      await transaction.rollback();
      return {
        statusCode: 500,
        message: `Error while creating member and wallet: ${error.message}`,
      };
    }
  },
};
