const logger = require("../logger")

module.exports = (app) => {
  // Request logging middleware
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    })
    next()
  })
}
