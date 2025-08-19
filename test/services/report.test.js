const app = require("../../src/app")
const request = require("supertest")
const Conversion = require("../../src/models/conversion.model")

describe("Report Service", () => {
  let server

  beforeAll(async () => {
    server = app.listen(0)

    // Create test conversions
    const today = new Date()
    await Conversion.create([
      {
        from: "USD",
        to: "EUR",
        amount: 100,
        convertedAmount: 85,
        rate: 0.85,
        timestamp: today,
      },
      {
        from: "EUR",
        to: "GBP",
        amount: 50,
        convertedAmount: 43,
        rate: 0.86,
        timestamp: today,
      },
    ])
  })

  afterAll(async () => {
    await Conversion.deleteMany({})
    await server.close()
  })

  describe("GET /report", () => {
    it("should generate daily report", async () => {
      const response = await request(app).get("/report").expect(200)

      expect(response.body).toHaveProperty("date")
      expect(response.body).toHaveProperty("totalConversions")
      expect(response.body).toHaveProperty("stats")
      expect(response.body).toHaveProperty("pdf")
      expect(response.body.totalConversions).toBeGreaterThan(0)
    })

    it("should generate report for specific date", async () => {
      const date = new Date().toISOString().split("T")[0]

      const response = await request(app).get(`/report?date=${date}`).expect(200)

      expect(response.body.date).toBe(date)
    })
  })
})
