const mongoose = require("mongoose")

const conversionSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
      uppercase: true,
    },
    to: {
      type: String,
      required: true,
      uppercase: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    convertedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ip: String,
    userAgent: String,
  },
  {
    timestamps: true,
  },
)

// Index for daily reports
conversionSchema.index({ timestamp: 1 })
conversionSchema.index({ from: 1, to: 1, timestamp: 1 })

module.exports = mongoose.model("Conversion", conversionSchema)
