const { authenticate } = require("@feathersjs/authentication").hooks
const Joi = require("joi")

const rateSchema = Joi.object({
  from: Joi.string().length(3).uppercase().required(),
  to: Joi.string().length(3).uppercase().required(),
  rate: Joi.number().positive().required(),
})

const validateRate = () => {
  return async (context) => {
    const { error } = rateSchema.validate(context.data)
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`)
    }
    return context
  }
}

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [validateRate()],
    update: [validateRate()],
    patch: [validateRate()],
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
