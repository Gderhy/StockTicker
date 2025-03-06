const { getStockModel } = require("../db/models/Stock");
const { fetchCompanySymbols } = require("./fetchCompanies");
const { generateNewStockValues } = require("../utils/helperFunctions");

/**
 * Fetch the latest stock data, using a stock data {} for efficiency.
 *
 * @param {Object} stockDataMap - A reference to the stock data object.
 */
async function fetchLatestStockData(stockDataObj) {
  try {
    // Initialize the stock data object if it's empty
    if (Object.keys(stockDataObj).length === 0) {
      console.log("Initializing stock data from database...");

      // Get all company symbols from the "companies" collection
      const companySymbols = await fetchCompanySymbols();

      await Promise.all(
        companySymbols.map(async (symbol) => {
          const StockModel = getStockModel(symbol);
          const latestStock = await StockModel.findOne().sort({ date: -1 });

          stockDataObj[symbol] = latestStock || null; 
        })
      );
    }

    // Loop through the existing stockDataObj and update if necessary
    await Promise.all(
      Object.entries(stockDataObj).map(async ([symbol, latestStock]) => {
        if (!latestStock) {
          console.warn(`Skipping update for ${symbol}, no initial stock data.`);
          return;
        }

        // Generate new stock values (50% chance)
        if (Math.random() < 0.5) {
          const newStock = generateNewStockValues(latestStock);

          // Save new stock data to DB
          const StockModel = getStockModel(symbol);
          await StockModel.create(newStock);

          // Update the object immediately
          stockDataObj[symbol] = newStock;
        }
      })
    );
  } catch (error) {
    console.error("Error fetching latest stock data:", error);
  }
}


module.exports = { fetchLatestStockData };
