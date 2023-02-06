const express = require("express");
const routes = require("./routes/index.js");
const database = require("./config/database.js");
const idempotency = require("express-idempotency");
const idempotencyCheck = require("./middlewares/idempotency.js");

const app = express();

app.use(idempotency.idempotency());
app.post("*", idempotencyCheck);

const configureExpress = () => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/", routes);
  return app;
};

module.exports = database.authenticate().then(configureExpress);
