const mongoose = require("mongoose"); // Mongoose ORM for MongoDB

// Define the stock model - this function will return a model for a given stock symbol
const getStockModel = (symbol) => {
  const stockSchema = new mongoose.Schema({
    date: {type:Date, required:true},
    open: {type:Number, required:true},
    high: {type:Number, required:true},
    low: {type:Number, required:true},
    close: {type:Number, required:true},
    volume: {type:Number, required:true},
  });
  return mongoose.model(symbol, stockSchema);
};

// Create a Company model for each passed company symbol
const getStockModels = (companySymbols) => {
  return companySymbols.map((symbol) => getStockModel(symbol));
}

// Export the models
module.exports = {getStockModel, getStockModels};
