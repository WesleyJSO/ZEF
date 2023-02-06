const idempotency = require("express-idempotency");

const idempotencyCheck = (req, res, next) => {
  const idempotencyService = idempotency.getSharedIdempotencyService();
  const key = idempotencyService.extractIdempotencyKeyFromReq(req);
  if (!key) {
    res
      .status(400)
      .json({ message: "The default headers Idempotency-Key is missing." });
    return;
  }
  if (idempotencyService.isHit(req)) {
    idempotencyService.reportError(req);
    res.status(102).json({ message: "Request being processed!" });
    return;
  }
  next();
};

module.exports = idempotencyCheck;
