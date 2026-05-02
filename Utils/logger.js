const winston = require("winston");
const path = require("path");

const logger = winston.createLogger({
  level: "error", // 🔥 only log errors (important)
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, "../error.log"),
      level: "error"
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "../combined.log")
    })
  ]
});

module.exports = logger;