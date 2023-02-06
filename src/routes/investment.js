const express = require("express");
const controller = require("../controllers/investment.js");

const router = express.Router();

router.post("/invest/kuna", controller.investInCroatianKuna);
router.post("/membership", controller.payMembershipFee);
router.post("/invest", controller.makeAnInvestment);
// router.post("/sell", controller.sellInvestment);

module.exports = router;
