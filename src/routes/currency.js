const express = require("express");
const controller = require("../controllers/currency.js");

const router = express.Router();

router.get("/currency", controller.findAll);

module.exports = router;
