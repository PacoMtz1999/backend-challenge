const app = require("../../src/app")
const request = require("supertest")
const Rate = require("../../src/models/rate.model")

describe("Convert Service", () => {
  let server

  beforeAll(async () => {
    server = app.listen(0)

    // Create test rate
    await Rate.create({
      from: "USD",
      to: "EUR",
      rate: 0.85,
      source: "manual",
    })
  })

  afterAll(async () => {
    await Rate.deleteMany({})
    await server.close()
  })

  describe("POST /convert", () => {
    it("should convert currency successfully", async () => {
      const conversionData = {
        from: "USD",
        to: "EUR",
        amount: 100,
      }

      const response = await request(app).post("/convert").send(conversionData).expect(201)

      expect(response.body.from).toBe("USD")
      expect(response.body.to).toBe("EUR")
      expect(response.body.amount).toBe(100)
      expect(response.body.convertedAmount).toBe(85)
      expect(response.body.rate).toBe(0.85)
    })

    it("should validate conversion data", async () => {
      const invalidData = {
        from: "USD",
        to: "USD", // Same currency
        amount: 100,
      }

      await request(app).post("/convert").send(invalidData).expect(400)
    })

    it("should handle missing exchange rate", async () => {
      const conversionData = {
        from: "USD",
        to: "JPY", // No rate available
        amount: 100,
      }

      await request(app).post("/convert").send(conversionData).expect(400)
    })
  })
})
