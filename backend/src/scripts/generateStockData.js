#!/usr/bin/env node
const mongoose = require("mongoose");
const connectDB = require("../DAO/connectDB"); // Import the database connection function
const StockCollection = require("../DAO/models/Stock"); // Import the Stock Collection

const stocks = [
  { symbol: "AAPL", companyName: "Apple", basePrice: 150 },
  { symbol: "GOOGL", companyName: "Google", basePrice: 2800 },
  { symbol: "MSFT", companyName: "Microsoft", basePrice: 300 },
]; // List of stocks with base prices

// Function to generate realistic stock data with volatility
async function generateStockData() {
  return Promise.all(
    stocks.map(async ({ symbol, companyName, basePrice }) => {
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

        for (let i = 0; i < 50; i++) {
          // Intra-day fluctuations using a smaller volatility range
          const volatility = (Math.random() - 0.5) * 0.04; // ±2% intra-day change
          const open = lastClose * (1 + volatility);
          const close = lastClose * (1 + (Math.random() - 0.5) * 0.03);
          const high = Math.max(open, close) * (1 + Math.random() * 0.02); // Up to +2% high
          const low = Math.min(open, close) * (1 - Math.random() * 0.02); // Down to -2% low
          const volume = Math.floor(Math.random() * 5000000) + 50000; // Random volume

          // Create a new stock entry for the current date
          const stockEntry = new StockCollection({
            symbol,
            companyName,
            open: open.toFixed(2),
            close: close.toFixed(2),
            high: high.toFixed(2),
            low: low.toFixed(2),
            volume,
            date: new Date(currentDateCopy),
            adjustedClose: close.toFixed(2),
          });

          stockData.push(stockEntry);
          currentDateCopy.setHours(currentDateCopy.getHours() + 0.5);
        }
        lastClose = stockData[stockData.length - 1].close; // Update for next day's base price
        currentDateCopy.setDate(currentDateCopy.getDate() + 1); // Move to the next day
      }

      // Save the generated stock data in MongoDB
      try {
        await StockCollection.insertMany(stockData);
        console.log(`Stock data for ${symbol} inserted successfully.`);
      } catch (error) {
        console.error("Error inserting stock data:", error);
      }

      return stockData;
    })
  );
}

// Connect to MongoDB and run the script
async function main() {
  try {
    await connectDB();

    // Optional: Clear existing data
    await StockCollection.deleteMany({});
    console.log("Cleared existing stock data.");

    await generateStockData();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    mongoose.connection.close();
  }
}

main();
