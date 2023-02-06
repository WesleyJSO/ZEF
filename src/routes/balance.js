const express = require("express");
const controller = require("../controllers/balance.js");

const router = express.Router();

router.get(
  "/balance/:memberId/:currencyId",
  controller.getMemberCurrencyBalance
);
router.get("/balance/:memberId", controller.getCroatinaKunaBalance);
router.get("/balance/", controller.getSumaryOfCurrencyValues);

module.exports = router;
