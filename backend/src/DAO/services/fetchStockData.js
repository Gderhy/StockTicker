const { getStockModel } = require("../models/Stock"); // Function to get a dynamic stock model
const { fetchCompanySymbols } = require("./fetchCompanies");

// Function to fetch the latest stock data for each stock company
async function fetchLatestStockData() {
  try {
    // Get all company symbols from the "companies" collection
    const companySymbols = await fetchCompanySymbols();

    // Fetch the latest stock data for each stock symbol
    const latestStockData = await Promise.all(
      companySymbols.map(async (symbol) => {
        try {
          const StockModel = getStockModel(symbol); // Get the dynamic stock model

          // Find the most recent stock entry for this company
          const latestStock = await StockModel.findOne().sort({ date: -1 });

          // If no stock data exists, return null
          if (!latestStock) {
            console.warn(`No stock data found for ${symbol}`);
            return null;
          }

          return {
            symbol,
            open: latestStock.open,
            close: latestStock.close,
            high: latestStock.high,
            low: latestStock.low,
            volume: latestStock.volume,
            date: latestStock.date,
          };
        } catch (error) {
          console.error(`Error fetching stock data for ${symbol}:`, error);
          return null;
        }
      })
    );

    // Filter out null values (in case of missing stock data)
    return latestStockData.filter((stock) => stock !== null);
  } catch (error) {
    console.error("Error fetching latest stock data:", error);
    return [];
  }
}

module.exports = { fetchLatestStockData };
