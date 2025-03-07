const mongoose = require("mongoose");
const connectDB = require("../db/connectDB");
const { getStockModels} = require("../db/models/Stock");
const CompanyModel = require("../db/models/Company"); //

const stocks = [
  {
    symbol: "AAPL",
    companyName: "Apple",
    foundingDate: new Date(),
    basePrice: 150,
  },
  {
    symbol: "GOOGL",
    companyName: "Google",
    foundingDate: new Date(),
    basePrice: 2800,
  },
  {
    symbol: "MSFT",
    companyName: "Microsoft",
    foundingDate: new Date(),
    basePrice: 300,
  },
  {
    symbol: "VPY",
    companyName: "Valpay",
    foundingDate: new Date(),
    basePrice: 5000,
  },
]; // List of stocks with base prices

// Function to generate realistic stock data with volatility
async function generateStockData(StockCollections) {
  await Promise.all(
    stocks.map(
      async ({ symbol, companyName, basePrice, foundingDate }, index) => {
        // Save the Company data in MongoDB
        try {
          const CompanyEntry = new CompanyModel({
            name: companyName,
            symbol: symbol,
            foundingDate,
          });
          await CompanyEntry.save();
          console.log(`Company data for ${symbol} inserted successfully.`);
        } catch (error) {
          console.error("Error inserting company data:", error);
        }

        // Get the stock model for the current symbol
        const StockModel = StockCollections[index];

        const stockData = [];
        const currentDate = new Date();
        const startDate = new Date();
        startDate.setMonth(currentDate.getMonth() - 6); // 6 months ago

        let currentDateCopy = new Date(startDate);
        let lastClose = basePrice; // Start from the base price

        while (currentDateCopy <= currentDate) {
          // Simulating a small market trend over time
          const dailyChange = (Math.random() - 0.5) * 2; // -1% to +1% daily movement
          lastClose *= 1 + dailyChange / 100; // Adjust base price gradually

          // Generate intra-day data for each day (50 data points per day)
          for (let i = 0; i < 50; i++) {
            // Intra-day fluctuations using a smaller volatility range
            const volatility = (Math.random() - 0.5) * 0.04; // ±2% intra-day change
            const open = lastClose * (1 + volatility);
            const close = lastClose * (1 + (Math.random() - 0.5) * 0.03);
            const high = Math.max(open, close) * (1 + Math.random() * 0.02); // Up to +2% high
            const low = Math.min(open, close) * (1 - Math.random() * 0.02); // Down to -2% low
            const volume = Math.floor(Math.random() * 5000000) + 50000; // Random volume

            const stockEntry = new StockModel({
              date: new Date(currentDateCopy),
              open,
              high,
              low,
              close,
              volume,
            });

            stockData.push(stockEntry);
            currentDateCopy.setHours(currentDateCopy.getHours() + 0.5); // 30-minute intervals
          }

          if (stockData.length > 0) {
            lastClose = stockData[stockData.length - 1].close;
          }

          currentDateCopy.setDate(currentDateCopy.getDate() + 1); // Move to the next day
        }

        // Save the generated stock data in MongoDB
        try {
          await StockModel.insertMany(stockData);
          console.log(`Stock data for ${symbol} inserted successfully.`);
        } catch (error) {
          console.error("Error inserting stock data:", error);
        }

        return stockData;
      }
    )
  );
}

// Connect to MongoDB and run the script
async function main() {
  try {
    await connectDB();

    // Optional: Clear existing data
    await CompanyModel.deleteMany({});
    console.log("Cleared existing Company data.");

    // Get the stock model for each symbol
    const StockModels = getStockModels(stocks.map((stock) => stock.symbol));

    // Clears each stock collection
    await Promise.all(
      StockModels.map(async (StockModel) => {
        await StockModel.deleteMany({});
        console.log(
          `Cleared existing stock data for ${StockModel.collection.name}.`
        );
      })
    );

    // Generate and insert new stock data into MongoDB
    await generateStockData(StockModels);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    mongoose.connection.close();
  }
}

main();
