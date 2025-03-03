const Stock = require("../models/Stock");

const stocks = ["AAPL", "GOOGL", "MSFT"]; // List of stock symbols

// Function to generate random stock data and save to MongoDB
async function generateStockData() {
  return Promise.all(
    stocks.map(async (stock) => {
      const price = (Math.random() * 100 + 100).toFixed(2); // Generate random price
      const stockEntry = new Stock({ stock, price }); // Create a new stock entry
      await stockEntry.save(); // Save stock data to MongoDB
      return { stock, price }; // Return stock data
    })
  );
}

module.exports = { generateStockData, stocks };
