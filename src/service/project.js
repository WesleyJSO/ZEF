const models = require("../models/index.js");

module.exports = {
  create: async ({ name, memberId, currencyName, alias, value, amount }) => {
    if (!name || !name.trim()) {
      return { statusCode: 400, message: "Project name should be informed!" };
    }
    if (!memberId) {
      return { statusCode: 400, message: "Member id should be informed!" };
    }
    if (!currencyName || !currencyName.trim()) {
      return { statusCode: 400, message: "Currency name should be informed!" };
    }
    if (!alias || !alias.trim()) {
      return { statusCode: 400, message: "Alias should be informed!" };
    }
    if (alias.trim().length !== 3) {
      return {
        statusCode: 400,
        message: "Alias length should be equals to 3!",
      };
    }
    const member = await models.sequelize.models.Member.findByPk(memberId);
    if (!member) {
      return {
        statusCode: 422,
        message: "Invalid member id, inform an existing member!",
      };
    }

    const transaction = await models.sequelize.transaction();
    try {
      const project = await models.sequelize.models.Project.create({
        name,
        memberId,
        value,
      });

      await models.sequelize.models.Currency.create({
        name: currencyName,
        amount,
        alias,
        type: "DIGITAL",
        projectId: project.id,
      });
      await transaction.commit();

      project.dataValues.currency = await project.getCurrency();
      return { statusCode: 201, message: project };
    } catch (error) {
      console.error(error);
      await transaction.rollback();
      return {
        statusCode: 500,
        message: `Error while creating project and currency: ${error.message}`,
      };
    }
    return { statusCode: 201, message: project };
  },
  findAll: async () => models.sequelize.models.Project.findAll(),
};
