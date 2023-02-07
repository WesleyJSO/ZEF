const service = require("../service/investment");

module.exports = {
  makeAnInvestment: async (req, res) => {
    try {
      const { statusCode, message } = await service.makeAnInvestment(req.body);

      res.status(statusCode).send(message);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  },
  payMembershipFee: async (req, res) => {
    try {
      const { statusCode, message } = await service.payMembershipFee(req.body);

      res.status(statusCode).send(message);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  },
  croatianKunaDeposity: async (req, res) => {
    try {
      const { statusCode, message } = await service.croatianKunaDeposity(
        req.body
      );

      res.status(statusCode).send(message);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  },
  withdraw: async (req, res) => {
    try {
      const { statusCode, message } = await service.withdraw({
        ...req.params,
        ...req.headers,
        ...req.body,
      });

      res.status(statusCode).send(message);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  },
};
