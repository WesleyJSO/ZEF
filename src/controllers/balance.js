const service = require("../service/balance");

module.exports = {
  getMemberCurrencyBalance: async (req, res) => {
    try {
      const { statusCode, message } = await service.getMemberCurrencyBalance(
        req.params
      );

      res.status(statusCode).send(message);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  },
  getAllBalance: async (req, res) => {
    try {
      const { statusCode, message } = await service.getAllBalance(req.params);

      res.status(statusCode).send(message);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  },
  getSumaryOfCurrencyValues: async (req, res) => {
    try {
      const { statusCode, message } = await service.getSumaryOfCurrencyValues(
        req.headers
      );

      res.status(statusCode).send(message);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  },
  getDetailedBalance: async (req, res) => {
    try {
      const { statusCode, message } = await service.getDetailedBalance(
        req.params
      );
      res.status(statusCode).send(message);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  },
};
