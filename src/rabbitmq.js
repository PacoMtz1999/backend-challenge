const amqp = require("amqplib")
const logger = require("./logger")

let connection = null
let channel = null

const QUEUE_NAME = "currency_conversions"

async function initializeRabbitMQ() {
  try {
    const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://localhost"
    connection = await amqp.connect(rabbitmqUrl)
    channel = await connection.createChannel()

    await channel.assertQueue(QUEUE_NAME, { durable: true })

    logger.info("RabbitMQ connection established")
    return { connection, channel }
  } catch (error) {
    logger.error("Failed to connect to RabbitMQ:", error)
    throw error
  }
}

async function publishToQueue(data) {
  try {
    if (!channel) {
      await initializeRabbitMQ()
    }

    const message = JSON.stringify(data)
    channel.sendToQueue(QUEUE_NAME, Buffer.from(message), { persistent: true })

    logger.info("Message published to queue:", data)
  } catch (error) {
    logger.error("Failed to publish message to queue:", error)
    throw error
  }
}

async function closeConnection() {
  try {
    if (channel) await channel.close()
    if (connection) await connection.close()
  } catch (error) {
    logger.error("Error closing RabbitMQ connection:", error)
  }
}

module.exports = {
  initializeRabbitMQ,
  publishToQueue,
  closeConnection,
  getChannel: () => channel,
}
