const rates = require("./rates/rates.service")
const convert = require("./convert/convert.service")
const report = require("./report/report.service")

module.exports = (app) => {
  app.configure(rates)
  app.configure(convert)
  app.configure(report)
}
