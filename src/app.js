const feathers = require("@feathersjs/feathers")
const express = require("@feathersjs/express")
const socketio = require("@feathersjs/socketio")
const configuration = require("@feathersjs/configuration")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")

const mongoose = require("./mongoose")
const logger = require("./logger")
const middleware = require("./middleware")
const services = require("./services")
const channels = require("./channels")
const { initializeRabbitMQ } = require("./rabbitmq")
const { startCronJobs } = require("./cron")

// Create an Express compatible Feathers application instance
const app = express(feathers())

// Load app configuration
app.configure(configuration())

// Enable security, CORS, compression and body parsing
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
)
app.use(cors())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Set up Plugins and providers
app.configure(express.rest())
app.configure(socketio())

// Configure database
app.configure(mongoose)

// Configure middleware
app.configure(middleware)

// Configure services
app.configure(services)

// Configure channels
app.configure(channels)

// Configure error handling
app.use(express.notFound())
app.use(express.errorHandler({ logger }))

const port = app.get("port") || 3030

async function startServer() {
  try {
    // Initialize RabbitMQ
    await initializeRabbitMQ()
    logger.info("RabbitMQ initialized successfully")

    // Start cron jobs
    startCronJobs()
    logger.info("Cron jobs started")

    // Start the server
    const server = app.listen(port)

    server.on("listening", () => {
      logger.info(`Currency Converter API started on http://localhost:${port}`)
    })

    return server
  } catch (error) {
    logger.error("Error starting server:", error)
    process.exit(1)
  }
}

if (require.main === module) {
  startServer()
}

module.exports = app
