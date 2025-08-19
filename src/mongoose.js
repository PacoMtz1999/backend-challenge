const mongoose = require("mongoose")
const logger = require("./logger")

module.exports = (app) => {
  const mongoUrl = process.env.MONGODB_URL || "mongodb://localhost:27017/currency_converter"

  mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  mongoose.connection.on("connected", () => {
    logger.info("Connected to MongoDB")
  })

  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB connection error:", err)
  })

  mongoose.connection.on("disconnected", () => {
    logger.info("Disconnected from MongoDB")
  })

  app.set("mongooseClient", mongoose)
}
