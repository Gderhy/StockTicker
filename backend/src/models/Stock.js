const mongoose = require("mongoose");

// Define Stock Schema for MongoDB
const stockSchema = new mongoose.Schema({
  stock: String, // Stock symbol
  price: Number, // Stock price
  time: { type: Date, default: Date.now }, // Timestamp
});

module.exports = mongoose.model("Stock", stockSchema); // Export Mongoose model
