const cron = require("node-cron")
const logger = require("./logger")

function startCronJobs() {
  // Update exchange rates every hour
  cron.schedule("0 * * * *", async () => {
    try {
      logger.info("Starting scheduled rate update...")

      // Get the rates service from the app
      const app = require("./app")
      const ratesService = app.service("rates")

      const updatedCount = await ratesService.updateRatesFromExternal()
      logger.info(`Updated ${updatedCount} exchange rates`)
    } catch (error) {
      logger.error("Failed to update rates in cron job:", error)
    }
  })

  logger.info("Cron jobs scheduled successfully")
}

module.exports = {
  startCronJobs,
}
