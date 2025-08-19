const Joi = require("joi")

const reportQuerySchema = Joi.object({
  date: Joi.date().iso().optional(),
})

const validateReportQuery = () => {
  return async (context) => {
    if (context.params.query) {
      const { error } = reportQuerySchema.validate(context.params.query)
      if (error) {
        throw new Error(`Validation error: ${error.details[0].message}`)
      }
    }
    return context
  }
}

module.exports = {
  before: {
    all: [],
    find: [validateReportQuery()],
    get: [],
    create: [],
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
