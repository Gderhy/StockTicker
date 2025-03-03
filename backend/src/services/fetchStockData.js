const Stock = require("../models/Stock");

// Function to fetch the latest stock data from MongoDB
async function fetchLatestStockData() {
  try {
    // Fetch the most recent stock data for each symbol
    const latestStockData = await Stock.aggregate([
      {
        $sort: { date: -1 }, // Sort by date in descending order
      },
      {
        $group: {
          _id: "$symbol", // Group by stock symbol
          latestPrice: { $first: "$close" }, // Get the most recent closing price
          latestOpen: { $first: "$open" }, // Get the most recent opening price
          latestHigh: { $first: "$high" }, // Get the most recent high price
          latestLow: { $first: "$low" }, // Get the most recent low price
          latestVolume: { $first: "$volume" }, // Get the most recent volume
          latestDate: { $first: "$date" }, // Get the most recent date
        },
      },
    ]);

    // Format the stock data for the WebSocket response
    const formattedStockData = latestStockData.map((stock) => ({
      symbol: stock._id,
      open: stock.latestOpen,
      close: stock.latestPrice,
      high: stock.latestHigh,
      low: stock.latestLow,
      volume: stock.latestVolume,
      date: stock.latestDate,
    }));

    // console.log("Latest stock data:", formattedStockData);
    return formattedStockData; // Return the latest stock data
  } catch (error) {
    console.error("Error fetching latest stock data:", error);
  }
}

module.exports = { fetchLatestStockData };
