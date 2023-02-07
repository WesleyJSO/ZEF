const service = require("../service/currency");

module.exports = {
  issueCurrency: async (req, res) => {
    try {
      const { statusCode, message } = await service.issueCurrency({
        ...req.headers,
        ...req.params,
        ...req.body,
      });

      res.status(statusCode).send(message);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  },
};
