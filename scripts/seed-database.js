const mongoose = require("mongoose")
const Rate = require("../src/models/rate.model")
const logger = require("../src/logger")

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/currency_converter"

const seedRates = [
  // FIAT to FIAT
  { from: "USD", to: "EUR", rate: 0.85, source: "manual" },
  { from: "EUR", to: "USD", rate: 1.18, source: "manual" },
  { from: "USD", to: "GBP", rate: 0.73, source: "manual" },
  { from: "GBP", to: "USD", rate: 1.37, source: "manual" },
  { from: "USD", to: "JPY", rate: 110.0, source: "manual" },
  { from: "JPY", to: "USD", rate: 0.0091, source: "manual" },
  { from: "USD", to: "MXN", rate: 20.5, source: "manual" },
  { from: "MXN", to: "USD", rate: 0.049, source: "manual" },

  // Crypto to FIAT
  { from: "BTC", to: "USD", rate: 45000, source: "manual" },
  { from: "USD", to: "BTC", rate: 0.000022, source: "manual" },
  { from: "ETH", to: "USD", rate: 3000, source: "manual" },
  { from: "USD", to: "ETH", rate: 0.00033, source: "manual" },
  { from: "USDT", to: "USD", rate: 1.0, source: "manual" },
  { from: "USD", to: "USDT", rate: 1.0, source: "manual" },

  // Crypto to EUR
  { from: "BTC", to: "EUR", rate: 38250, source: "manual" },
  { from: "EUR", to: "BTC", rate: 0.000026, source: "manual" },
  { from: "ETH", to: "EUR", rate: 2550, source: "manual" },
  { from: "EUR", to: "ETH", rate: 0.00039, source: "manual" },
]

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    logger.info("Connected to MongoDB for seeding")

    // Clear existing rates
    await Rate.deleteMany({})
    logger.info("Cleared existing rates")

    // Insert seed data
    await Rate.insertMany(seedRates)
    logger.info(`Inserted ${seedRates.length} exchange rates`)

    logger.info("Database seeding completed successfully")
  } catch (error) {
    logger.error("Error seeding database:", error)
  } finally {
    await mongoose.connection.close()
    logger.info("Database connection closed")
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
}

module.exports = seedDatabase
