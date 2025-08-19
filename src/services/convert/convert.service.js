const createModel = require("../../models/conversion.model")
const Rate = require("../../models/rate.model")
const hooks = require("./convert.hooks")
const { publishToQueue } = require("../../rabbitmq")
const logger = require("../../logger")

class ConvertService {
  constructor(options, app) {
    this.options = options || {}
    this.app = app
    this.Model = createModel
  }

  async create(data, params) {
    const { from, to, amount } = data

    // Find the conversion rate
    let rate = await Rate.findOne({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
    })

    if (!rate) {
      // Try reverse rate
      const reverseRate = await Rate.findOne({
        from: to.toUpperCase(),
        to: from.toUpperCase(),
      })

      if (reverseRate) {
        rate = {
          from: from.toUpperCase(),
          to: to.toUpperCase(),
          rate: 1 / reverseRate.rate,
        }
      } else {
        throw new Error(`Exchange rate not found for ${from} to ${to}`)
      }
    }

    // Calculate converted amount
    const convertedAmount = amount * rate.rate

    // Create conversion record
    const conversion = await this.Model.create({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount,
      convertedAmount,
      rate: rate.rate,
      ip: params.ip,
      userAgent: params.headers?.["user-agent"],
    })

    // Publish to RabbitMQ queue
    try {
      await publishToQueue({
        conversionId: conversion._id,
        from: conversion.from,
        to: conversion.to,
        amount: conversion.amount,
        convertedAmount: conversion.convertedAmount,
        rate: conversion.rate,
        timestamp: conversion.timestamp,
      })
    } catch (error) {
      logger.error("Failed to publish conversion to queue:", error)
    }

    return {
      from: conversion.from,
      to: conversion.to,
      amount: conversion.amount,
      convertedAmount: conversion.convertedAmount,
      rate: conversion.rate,
      timestamp: conversion.timestamp,
    }
  }

  async find(params) {
    const conversions = await this.Model.find(params.query || {})
      .sort({ timestamp: -1 })
      .limit(params.query?.$limit || 50)

    return {
      total: await this.Model.countDocuments(params.query || {}),
      data: conversions,
    }
  }
}

module.exports = (app) => {
  const options = {
    paginate: app.get("paginate"),
  }

  app.use("/convert", new ConvertService(options, app))
  app.service("convert").hooks(hooks)
}
