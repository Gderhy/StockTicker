const { getStockModel } = require("../db/models/Stock"); // Function to get the dynamic model
const { getRangeQuery } = require("../utils/getRangeQuery"); // Helper function to get range query

// Function to fetch filtered stock data from MongoDB
async function fetchHistoricalStockData(stockSymbol, range) {
  try {
    console.log(
      `Fetching stock data for ${stockSymbol} with range ${range}...`
    );

    const StockModel = getStockModel(stockSymbol);
    const query = getRangeQuery(range); // Call the helper function

    // Fetch filtered stock data, sorted by latest date
    const stockData = await StockModel.find(query).sort({ date: 1 });

    return stockData;
  } catch (error) {
    console.error(`Error fetching stock data for ${stockSymbol}:`, error);
    return [];
  }
}

module.exports = { fetchHistoricalStockData };
