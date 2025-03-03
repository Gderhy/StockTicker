const Stock = require("../DAO/models/Stock"); // Import the Stock model (DB schema)

const stocks = ["AAPL", "GOOGL", "MSFT"]; // List of stock symbols

// Function to generate random stock data and save to MongoDB
async function generateStockData() {
  return Promise.all(
    stocks.map(async (symbol) => {
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
        const stockEntry = new Stock({
          symbol, // The stock symbol (e.g., AAPL)
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
        await Stock.insertMany(stockData); // Insert multiple stock records at once
        console.log(`Stock data for ${symbol} inserted successfully.`);
      } catch (error) {
        console.error("Error inserting stock data:", error);
      }

      return stockData; // Return the generated stock data for verification
    })
  );
}

module.exports = { generateStockData, stocks };
