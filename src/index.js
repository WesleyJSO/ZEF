const express = require("express");
var http = require("http");
const project = require("./routes/project.js");
const database = require("./config/database.js");

const app = express();

const configureExpress = () => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/", project);
  return app;
};

module.exports = database.authenticate().then(configureExpress);
