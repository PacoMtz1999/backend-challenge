const { Service } = require("feathers-mongoose")
const createModel = require("../../models/rate.model")
const hooks = require("./rates.hooks")
const { fetchExternalRates } = require("./rates.external")

class RatesService extends Service {
  async find(params) {
    // Get current rates from database
    const rates = await super.find(params)

    // If no rates found or rates are old, fetch from external APIs
    if (!rates.data || rates.data.length === 0) {
      await this.updateRatesFromExternal()
      return await super.find(params)
    }

    return rates
  }

  async create(data, params) {
    // Manual rate update
    const existingRate = await this.Model.findOne({
      from: data.from.toUpperCase(),
      to: data.to.toUpperCase(),
    })

    if (existingRate) {
      return await this.patch(existingRate._id, {
        rate: data.rate,
        source: "manual",
        lastUpdated: new Date(),
      })
    }

    return await super.create(
      {
        ...data,
        from: data.from.toUpperCase(),
        to: data.to.toUpperCase(),
        source: "manual",
      },
      params,
    )
  }

  async updateRatesFromExternal() {
    try {
      const externalRates = await fetchExternalRates()

      for (const rateData of externalRates) {
        await this.Model.findOneAndUpdate(
          { from: rateData.from, to: rateData.to },
          { ...rateData, lastUpdated: new Date() },
          { upsert: true, new: true },
        )
      }

      return externalRates.length
    } catch (error) {
      throw new Error(`Failed to update rates from external APIs: ${error.message}`)
    }
  }
}

module.exports = (app) => {
  const options = {
    Model: createModel,
    paginate: app.get("paginate"),
  }

  app.use("/rates", new RatesService(options, app))
  app.service("rates").hooks(hooks)
}
