// ./src/DAO/services/fetchSpecificStockData.js
const StockCollection = require("../models/Stock");

// Function to fetch specific stock data
async function fetchSpecificStockData(stockSymbol) {
  try {
    console.log(`Fetching specific stock data for ${stockSymbol}...`);
    const stockData = await StockCollection.find({ symbol: stockSymbol })
      .sort({ date: -1 }) // Sort by date in descending order
    return stockData;
  } catch (error) {
    console.error(
      `Error fetching specific stock data for ${stockSymbol}:`,
      error
    );
    return [];
  }
}

module.exports = { fetchSpecificStockData };
