const { getStockModel } = require("../db/models/Stock");
const { fetchCompanySymbols } = require("./fetchCompanies");
const { generateNewStockValues } = require("../utils/helperFunctions");

/**
 * Fetch the latest stock data, using a stock data map for efficiency.
 *
 * @param {Map<string, Object>} stockDataMap - A reference to the stock data map.
 */
async function fetchLatestStockData(stockDataMap) {
  try {
    // Initialize the stock data map if it's empty
    if (stockDataMap.size === 0) {
      console.log("Initializing stock data map from database...");

      // Get all company symbols from the "companies" collection
      const companySymbols = await fetchCompanySymbols();

      await Promise.all(
        companySymbols.map(async (symbol) => {
          const StockModel = getStockModel(symbol);
          const latestStock = await StockModel.findOne().sort({ date: -1 });

          if (latestStock) {
            stockDataMap.set(symbol, latestStock);
          } else {
            console.warn(
              `No stock data found for ${symbol}, initializing with empty values.`
            );
            stockDataMap.set(symbol, null);
          }
        })
      );
    }

    // Loop through the existing stockDataMap and update if necessary
    await Promise.all(
      Array.from(stockDataMap.entries()).map(async ([symbol, latestStock]) => {
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

          // Update the map immediately
          stockDataMap.set(symbol, newStock);
        }
      })
    );

    // console.log("Stock data map updated.");
  } catch (error) {
    console.error("Error fetching latest stock data:", error);
  }
}

module.exports = { fetchLatestStockData };
