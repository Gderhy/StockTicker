const { getStockModel } = require("../db/models/Stock");
const { fetchCompanies } = require("./fetchCompanies"); // ✅ Fetch both symbol & companyName
const { generateNewStockValues } = require("../utils/helperFunctions");

/**
 * Fetch the latest stock data, using a stock data {} for efficiency.
 *
 * @param {Object} stockDataObj - A reference to the stock data object.
 */
async function fetchLatestStockData(stockDataObj) {
  try {
    // Initialize the stock data object if it's empty
    if (Object.keys(stockDataObj).length === 0) {
      console.log("Initializing stock data from database...");

      // Get all companies (including symbols & company names)
      const companies = await fetchCompanies();

      await Promise.all(
        companies.map(async ({ symbol, name }) => {
          const StockModel = getStockModel(symbol);
          const latestStock = await StockModel.findOne().sort({ date: -1 });

          stockDataObj[symbol] = {
            symbol,
            companyName: name, // ✅ Include company name
            ...latestStock?._doc, // ✅ Ensure stock data is merged properly
          };
        })
      );
    }

    // Loop through the existing stockDataObj and update if necessary
    await Promise.all(
      Object.entries(stockDataObj).map(async ([symbol, stockData]) => {
        if (!stockData || !stockData.close) {
          console.warn(`Skipping update for ${symbol}, no initial stock data.`);
          return;
        }

        // Generate new stock values (50% chance)
        if (Math.random() < 0.5) {
          const newStock = generateNewStockValues(stockData);

          // Save new stock data to DB
          const StockModel = getStockModel(symbol);
          await StockModel.create(newStock);

          // Update the object immediately
          stockDataObj[symbol] = {
            symbol,
            companyName: stockData.companyName, // ✅ Keep company name
            ...newStock,
          };
        }
      })
    );
  } catch (error) {
    console.error("Error fetching latest stock data:", error);
  }
}

module.exports = { fetchLatestStockData };
