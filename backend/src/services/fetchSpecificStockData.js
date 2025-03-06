const { getStockModel } = require("../db/models/Stock"); // Function to get the dynamic model

// Function to fetch specific stock data for a given stock symbol
async function fetchSpecificStockData(stockSymbol) {
  try {
    console.log(`Fetching specific stock data for ${stockSymbol}...`);

    // Get the dynamic stock model for this symbol
    const StockModel = getStockModel(stockSymbol);

    // Fetch stock data, sorted by date (latest first)
    const stockData = await StockModel.find().sort({ date: -1 });

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
