const express = require("express");
const controller = require("../controllers/currency.js");

const router = express.Router();

router.put("/issue/:currencyId", controller.issueCurrency);

module.exports = router;
