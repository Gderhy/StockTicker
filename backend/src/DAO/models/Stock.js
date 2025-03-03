const mongoose = require("mongoose");

// Define Stock Schema for historical values
const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true, // Stock symbol is required
      uppercase: true, // Ensure the stock symbol is in uppercase (e.g., "AAPL")
      trim: true, // Remove extra spaces if any
    },
    companyName: {
      type: String, // Optional field for company name
      default: null, // If not provided, set to null
    },
    open: {
      type: Number,
      required: true, // Opening price is required
    },
    close: {
      type: Number,
      required: true, // Closing price is required
    },
    high: {
      type: Number,
      required: true, // High price is required
    },
    low: {
      type: Number,
      required: true, // Low price is required
    },
    volume: {
      type: Number,
      required: true, // Volume is required
    },
    date: {
      type: Date,
      default: Date.now, // Defaults to current date and time if not provided
      index: true, // Index to improve querying based on date
      required: true, // Date is required
    },
    adjustedClose: {
      type: Number, // Optional field for adjusted closing price
      default: null, // If not provided, set to null
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Indexing on 'symbol' and 'date' for faster querying
stockSchema.index({ symbol: 1, date: -1 }); // Index by symbol and descending date

// Export the models
module.exports = mongoose.model("HistoricalStock", stockSchema);
