const service = require("../service/member");

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
};
