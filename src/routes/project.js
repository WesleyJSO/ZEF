const express = require("express");
const controller = require("../controllers/project.js");

const router = express.Router();

router.post("/project", controller.create);
router.get("/project", controller.findAll);

module.exports = router;
