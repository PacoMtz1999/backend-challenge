const Conversion = require("../../models/conversion.model")
const { generatePDF } = require("./pdf-generator")
const hooks = require("./report.hooks")

class ReportService {
  constructor(options, app) {
    this.options = options || {}
    this.app = app
  }

  async find(params) {
    const { date } = params.query || {}

    // Default to today if no date provided
    const targetDate = date ? new Date(date) : new Date()
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))

    // Get conversions for the specified day
    const conversions = await Conversion.find({
      timestamp: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ timestamp: -1 })

    // Generate statistics
    const stats = await this.generateStats(conversions, startOfDay, endOfDay)

    // Generate PDF
    const pdfBuffer = await generatePDF(conversions, stats, targetDate)

    return {
      date: targetDate.toISOString().split("T")[0],
      totalConversions: conversions.length,
      stats,
      pdf: pdfBuffer.toString("base64"),
    }
  }

  async generateStats(conversions, startDate, endDate) {
    const stats = {
      totalConversions: conversions.length,
      totalVolume: 0,
      currencyPairs: {},
      topCurrencies: {},
      hourlyDistribution: Array(24).fill(0),
    }

    conversions.forEach((conversion) => {
      // Total volume (in USD equivalent, simplified)
      stats.totalVolume += conversion.amount

      // Currency pairs
      const pair = `${conversion.from}/${conversion.to}`
      stats.currencyPairs[pair] = (stats.currencyPairs[pair] || 0) + 1

      // Top currencies
      stats.topCurrencies[conversion.from] = (stats.topCurrencies[conversion.from] || 0) + 1
      stats.topCurrencies[conversion.to] = (stats.topCurrencies[conversion.to] || 0) + 1

      // Hourly distribution
      const hour = new Date(conversion.timestamp).getHours()
      stats.hourlyDistribution[hour]++
    })

    // Sort and limit top items
    stats.topCurrencyPairs = Object.entries(stats.currencyPairs)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    stats.topCurrenciesList = Object.entries(stats.topCurrencies)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    return stats
  }
}

module.exports = (app) => {
  app.use("/report", new ReportService({}, app))
  app.service("report").hooks(hooks)
}
