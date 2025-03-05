const mongoose = require("mongoose"); // Mongoose ORM for MongoDB

// Function to return a stock model for a given stock symbol
const getStockModel = (symbol) => {
  // If the model already exists, return it
  if (mongoose.models[symbol]) {
    return mongoose.models[symbol];
  }

  // Define the stock schema
  const stockSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    open: { type: Number, required: true },
    high: { type: Number, required: true },
    low: { type: Number, required: true },
    close: { type: Number, required: true },
    volume: { type: Number, required: true },
  });

  return mongoose.model(symbol, stockSchema);
};

// Function to get multiple stock models for a list of company symbols
const getStockModels = (companySymbols) => {
  return companySymbols.map(symbol => getStockModel(symbol));
};


// Export the models
module.exports = { getStockModel, getStockModels };
