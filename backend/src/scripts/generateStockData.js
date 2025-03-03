#!/usr/bin/env node
const mongoose = require("mongoose");
const connectDB = require("../DAO/connectDB"); // Import the database connection function
const StockCollection = require("../DAO/models/Stock"); // Import the Stock Collection 

const stocks = [
  { symbol: "AAPL", companyName: "Apple" },
  { symbol: "GOOGL", companyName: "Google" },
  { symbol: "MSFT", companyName: "Microsoft" },
]; // List of stock symbols

// Function to generate random stock data and save to MongoDB
async function generateStockData() {
  return Promise.all(
    stocks.map(async ({symbol, companyName}) => {
      const stockData = [];

      // Generate stock data for a specific date range (e.g., last 6 months)
      const currentDate = new Date();
      const startDate = new Date();
      startDate.setMonth(currentDate.getMonth() - 6); // 6 months ago

      let currentDateCopy = new Date(startDate);

      while (currentDateCopy <= currentDate) {
        // Randomly generate stock data for each day
        const open = (Math.random() * 100 + 100).toFixed(2); // Random opening price
        const close = (Math.random() * 100 + 100).toFixed(2); // Random closing price
        const high = Math.max(open, close) + Math.random() * 10; // Random high price
        const low = Math.min(open, close) - Math.random() * 10; // Random low price
        const volume = Math.floor(Math.random() * 1000000) + 10000; // Random volume

        // Create a new stock entry for the current date
        const stockEntry = new StockCollection({
          symbol, // The stock symbol (e.g., AAPL)
          companyName, // The company name (e.g., Apple)
          open,
          close,
          high,
          low,
          volume,
          date: currentDateCopy, // Current date in the loop
          adjustedClose: null, // Optional, can be left as null
        });

        stockData.push(stockEntry); // Add to array to save later
        currentDateCopy.setDate(currentDateCopy.getDate() + 1); // Move to the next day
      }

      // Save the generated stock data in MongoDB
      try {
        await StockCollection.insertMany(stockData); // Insert multiple stock records at once
        console.log(`Stock data for ${symbol} inserted successfully.`);
      } catch (error) {
        console.error("Error inserting stock data:", error);
      }

      return stockData; // Return the generated stock data for verification
    })
  );
}

// Connect to MongoDB and run the script
async function main() {
  try {
    await connectDB(); // Connect to MongoDB

    // Clear existing data
    await StockCollection.deleteMany({});
    console.log("Cleared existing stock data.");

    // Generate and save stock data
    await generateStockData();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    mongoose.connection.close(); // Close the MongoDB connection
  }
}

main();
