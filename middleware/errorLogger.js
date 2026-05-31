const logger = require("../Utils/logger");

const errorLogger = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl
  });

  next(err);
};

module.exports = errorLogger;