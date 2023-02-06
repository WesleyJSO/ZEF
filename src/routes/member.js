const express = require("express");
const controller = require("../controllers/member.js");

const router = express.Router();

router.post("/member", controller.create);

module.exports = router;
