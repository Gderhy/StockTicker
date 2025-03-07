const { connectDB, disconnectDB } = require("../db/mongoDb");
const CompanyModel = require("../db/models/Company");
const { getStockModels, getStockModel } = require("../db/models/Stock");
const { fetchPolygonData } = require("../services/fetchPolygon");
const { clearModelFromDb } = require("./helperFunctions/clearModelFromDb");
const { stocks } = require("./stocks");
const { insertCompanyData } = require("./helperFunctions/insertCompanyData");

// Function to load historical data into MongoDB
async function loadHistoricalData() {
  try {
    await connectDB();

    // Clear the db
    // Optional: Clear existing data
    await clearModelFromDb(CompanyModel);

    // Get the stock model for each symbol
    const stockSymbols = stocks.map((stock) => stock.symbol);
    const StockModels = getStockModels(stockSymbols);

    // Clears each stock collection
    await Promise.all(
      StockModels.map(async (StockModel) => {
        await clearModelFromDb(StockModel);
      })
    );

    // Insert the company data
    await Promise.all(
      stocks.map(async ({ symbol, companyName, foundingDate }) => {
        
        // Insert company data
        await insertCompanyData({ companyName, symbol, foundingDate });

        const StockModel = getStockModel(symbol);

        // Fetch data from Polygon
        const historicalData = await fetchPolygonData(symbol);
        if (!historicalData.length) return;

        // Insert data into MongoDB
        await StockModel.insertMany(historicalData);
        console.log(`Inserted historical data for ${symbol}.`);
      })
    );
  } catch (error) {
    console.error("Error loading historical data:", error);
  } finally {
    await disconnectDB();
  }
}

loadHistoricalData();
