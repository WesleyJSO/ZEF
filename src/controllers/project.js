const models = require("../models/index.js");
const service = require("../service/project");

module.exports = {
  create: async (req, res) => {
    try {
      const { statusCode, message } = await service.create(req.body);

      res.status(statusCode).send(message);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  },

  findAll: async ({ res }) => {
    try {
      res.status(200).send(await service.findAll());
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  },
};
