const Joi = require("joi")
const { CRYPTO_CURRENCIES, FIAT_CURRENCIES } = require("../rates/rates.external")

const ALL_CURRENCIES = [...CRYPTO_CURRENCIES, ...FIAT_CURRENCIES]

const convertSchema = Joi.object({
  from: Joi.string()
    .valid(...ALL_CURRENCIES)
    .required(),
  to: Joi.string()
    .valid(...ALL_CURRENCIES)
    .required(),
  amount: Joi.number().positive().required(),
})

const validateConversion = () => {
  return async (context) => {
    const { error } = convertSchema.validate(context.data)
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`)
    }

    if (context.data.from === context.data.to) {
      throw new Error("Source and target currencies cannot be the same")
    }

    return context
  }
}

const addRequestInfo = () => {
  return async (context) => {
    if (context.params.provider === "rest") {
      context.params.ip = context.params.req?.ip
      context.params.headers = context.params.req?.headers
    }
    return context
  }
}

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [addRequestInfo(), validateConversion()],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
}
