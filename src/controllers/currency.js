const service = require("../service/currency");

module.exports = {
  findAll: async (req, res) => {
    try {
      const { statusCode, message } = await service.findAll();

      res.status(statusCode).send(message);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  },
};
