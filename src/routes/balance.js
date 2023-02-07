const express = require("express");
const controller = require("../controllers/balance.js");

const router = express.Router();

router.get(
  "/balance/:memberId/:currencyId",
  controller.getMemberCurrencyBalance
);
router.get("/balance/:memberId", controller.getAllBalance);
router.get("/balance", controller.getSumaryOfCurrencyValues);
router.get(
  "/detailed-balance/:memberId/:currencyId",
  controller.getDetailedBalance
);

module.exports = router;
