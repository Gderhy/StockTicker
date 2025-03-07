const { connectDB, disconnectDB } = require("../db/mongoDb");
const CompanyModel = require("../db/models/Company");
const { getStockModels, getStockModel } = require("../db/models/Stock");
const { fetchPolygonData } = require("../services/fetchPolygon");
const { clearModelFromDb } = require("./helperFunctions/clearModelFromDb");
const { stocks } = require("./stocks");
const { insertCompanyData } = require("./helperFunctions/insertCompanyData");

async function loadPQueue() {
  const PQueue = (await import("p-queue")).default; // Dynamically import p-queue
  return new PQueue({
    interval: 60000, // 60 seconds
    intervalCap: 5, // Max 5 requests per minute
  });
}

async function processStock({ symbol, companyName, foundingDate }) {
  try {
    // Fetch historical data from Polygon.io
    const historicalData = await fetchPolygonData(symbol);
    if (!historicalData) {
      throw new Error(`No data found for ${symbol}`);
    }

    // Insert company data into the database
    await insertCompanyData({ companyName, symbol, foundingDate });

    // Insert historical data into the database
    const StockModel = getStockModel(symbol);
    console.log(`Fetching historical data for ${symbol}...`);

    if (historicalData.length > 0) {
      await StockModel.insertMany(historicalData);
      console.log(`Inserted historical data for ${symbol}.`);
    } else {
      console.warn(`No data found for ${symbol}.`);
    }
  } catch (error) {
    console.error(`Error processing ${symbol}:`, error);
  }
}

async function loadHistoricalData() {
  try {
    await connectDB();
    const queue = await loadPQueue(); // Load p-queue dynamically

    // Clear the database
    await clearModelFromDb(CompanyModel);

    const stockSymbols = stocks.map((stock) => stock.symbol);
    const StockModels = getStockModels(stockSymbols);

    // Clear all stock data from the database
    await Promise.all(
      StockModels.map((StockModel) => clearModelFromDb(StockModel))
    );

    console.log("Adding stocks to processing queue...");

    // Add stock processing tasks to the queue
    for (const stock of stocks) {
      queue.add(() => processStock(stock));
    }

    // Wait for all tasks to complete
    await queue.onIdle();
    console.log("All stock data processed.");
  } catch (error) {
    console.error("Error loading historical data:", error);
  } finally {
    await disconnectDB();
  }
}

loadHistoricalData();
