const app = require("../../src/app")
const request = require("supertest")

describe("Rates Service", () => {
  let server

  beforeAll(async () => {
    server = app.listen(0)
  })

  afterAll(async () => {
    await server.close()
  })

  describe("GET /rates", () => {
    it("should return exchange rates", async () => {
      const response = await request(app).get("/rates").expect(200)

      expect(response.body).toHaveProperty("data")
      expect(Array.isArray(response.body.data)).toBe(true)
    })
  })

  describe("POST /rates", () => {
    it("should create a new rate", async () => {
      const rateData = {
        from: "USD",
        to: "EUR",
        rate: 0.85,
      }

      const response = await request(app).post("/rates").send(rateData).expect(201)

      expect(response.body.from).toBe("USD")
      expect(response.body.to).toBe("EUR")
      expect(response.body.rate).toBe(0.85)
    })

    it("should validate rate data", async () => {
      const invalidData = {
        from: "US", // Invalid: too short
        to: "EUR",
        rate: -1, // Invalid: negative
      }

      await request(app).post("/rates").send(invalidData).expect(400)
    })
  })
})
