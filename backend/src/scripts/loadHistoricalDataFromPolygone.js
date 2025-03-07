const { connectDB, disconnectDB } = require("../db/mongoDb");
const CompanyModel = require("../db/models/Company");
const { getStockModels, getStockModel } = require("../db/models/Stock");
const { fetchPolygonData } = require("../services/fetchPolygon");
const { clearModelFromDb } = require("./helperFunctions/clearModelFromDb");
const { stocks } = require("./stocks");
const { insertCompanyData } = require("./helperFunctions/insertCompanyData");

async function processStock({ symbol, companyName, foundingDate }) {
  try {
    console.log(`Fetching historical data for ${symbol}...`);

    const historicalData = await fetchPolygonData(symbol);
    if (!historicalData || historicalData.length === 0) {
      console.warn(`No data found for ${symbol}.`);
      return;
    }

    await insertCompanyData({ companyName, symbol, foundingDate });

    const StockModel = getStockModel(symbol);
    await StockModel.insertMany(historicalData);
    console.log(`Inserted historical data for ${symbol}.`);
  } catch (error) {
    console.error(`Error processing ${symbol}:`, error);
  }
}

async function loadHistoricalData() {
  try {
    await connectDB();

    // Clear the database
    await clearModelFromDb(CompanyModel);

    const stockSymbols = stocks.map((stock) => stock.symbol);
    const StockModels = getStockModels(stockSymbols);

    // Clear all stock data from the database
    await Promise.all(
      StockModels.map((StockModel) => clearModelFromDb(StockModel))
    );

    console.log("Processing all stocks in parallel...");

    // Process all stocks at once without waiting
    await Promise.all(stocks.map((stock) => processStock(stock)));

    console.log("All stock data processed.");
  } catch (error) {
    console.error("Error loading historical data:", error);
  } finally {
    await disconnectDB();
  }
}

loadHistoricalData();
