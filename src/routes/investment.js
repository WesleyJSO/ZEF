const express = require("express");
const controller = require("../controllers/investment.js");

const router = express.Router();

router.post("/deposit/kuna", controller.croatianKunaDeposity);
router.post("/membership", controller.payMembershipFee);
router.post("/invest", controller.makeAnInvestment);
router.post("/withdraw/:currencyId", controller.returnCurrency);

module.exports = router;
