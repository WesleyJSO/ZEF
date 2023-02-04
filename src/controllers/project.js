const models = require("../models/index.js");

module.exports = {
  create: async ({ body, res }) => {
    try {
      const project = await models.sequelize.models.Project.create({
        name: body.name,
      });
      res.send(project);
    } catch (error) {
      throw new Error(error);
    }
  },

  findAll: async ({ res }) => {
    try {
      const projects = await models.sequelize.models.Project.findAll();
      res.send(projects);
    } catch (error) {
      throw new Error(error);
    }
  },

  findById: async ({ params, res }) => {
    try {
      const project = await models.sequelize.models.Project.findByPk(params.id);
      res.send(project.dataValues);
    } catch (error) {
      throw new Error(error);
    }
  },
};
