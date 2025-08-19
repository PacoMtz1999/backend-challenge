const mongoose = require("mongoose")

const rateSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    to: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      enum: ["coingecko", "openexchangerates", "manual"],
      default: "manual",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index for efficient lookups
rateSchema.index({ from: 1, to: 1 }, { unique: true })

module.exports = mongoose.model("Rate", rateSchema)
