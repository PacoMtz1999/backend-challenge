const axios = require("axios")
const logger = require("../../logger")

const COINGECKO_API = "https://api.coingecko.com/api/v3"
const OPENEXCHANGE_API = "https://openexchangerates.org/api"

// Mapping of common currency codes to CoinGecko IDs
const CRYPTO_MAPPING = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  BNB: "binancecoin",
  ADA: "cardano",
  DOT: "polkadot",
  XRP: "ripple",
}

const FIAT_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "MXN", "BRL"]
const CRYPTO_CURRENCIES = Object.keys(CRYPTO_MAPPING)

async function fetchCryptoRates() {
  try {
    const cryptoIds = Object.values(CRYPTO_MAPPING).join(",")
    const vsCurrencies = FIAT_CURRENCIES.join(",").toLowerCase()

    const response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: cryptoIds,
        vs_currencies: vsCurrencies,
        include_24hr_change: false,
      },
      timeout: 10000,
    })

    const rates = []

    for (const [cryptoId, prices] of Object.entries(response.data)) {
      const cryptoSymbol = Object.keys(CRYPTO_MAPPING).find((key) => CRYPTO_MAPPING[key] === cryptoId)

      for (const [fiatCurrency, price] of Object.entries(prices)) {
        rates.push({
          from: cryptoSymbol,
          to: fiatCurrency.toUpperCase(),
          rate: price,
          source: "coingecko",
        })

        // Add reverse rate
        rates.push({
          from: fiatCurrency.toUpperCase(),
          to: cryptoSymbol,
          rate: 1 / price,
          source: "coingecko",
        })
      }
    }

    return rates
  } catch (error) {
    logger.error("Failed to fetch crypto rates from CoinGecko:", error.message)
    return []
  }
}

async function fetchFiatRates() {
  try {
    // Using a free tier, you might need to register for an API key
    const response = await axios.get(`${OPENEXCHANGE_API}/latest.json`, {
      params: {
        app_id: process.env.OPENEXCHANGE_API_KEY || "demo", // Use demo for testing
        symbols: FIAT_CURRENCIES.join(","),
      },
      timeout: 10000,
    })

    const rates = []
    const baseRate = response.data.rates

    // Convert USD-based rates to all currency pairs
    for (const fromCurrency of FIAT_CURRENCIES) {
      for (const toCurrency of FIAT_CURRENCIES) {
        if (fromCurrency !== toCurrency) {
          const fromRate = fromCurrency === "USD" ? 1 : baseRate[fromCurrency]
          const toRate = toCurrency === "USD" ? 1 : baseRate[toCurrency]

          if (fromRate && toRate) {
            rates.push({
              from: fromCurrency,
              to: toCurrency,
              rate: toRate / fromRate,
              source: "openexchangerates",
            })
          }
        }
      }
    }

    return rates
  } catch (error) {
    logger.error("Failed to fetch fiat rates from OpenExchangeRates:", error.message)
    return []
  }
}

async function fetchExternalRates() {
  const [cryptoRates, fiatRates] = await Promise.all([fetchCryptoRates(), fetchFiatRates()])

  return [...cryptoRates, ...fiatRates]
}

module.exports = {
  fetchExternalRates,
  fetchCryptoRates,
  fetchFiatRates,
  CRYPTO_CURRENCIES,
  FIAT_CURRENCIES,
}
