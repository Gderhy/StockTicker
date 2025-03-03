const StockCollection = require("../models/Stock");
const { generateNewStockValues } = require("../../utils/helperFunctions");


// Function to fetch the latest stock data with 1 in 5 chance of update
async function fetchLatestStockData() {
  try {
    const latestStockData = await StockCollection.aggregate([
      { $sort: { date: -1 } }, // Sort by date in descending order
      {
        $group: {
          _id: "$symbol",
          companyName: { $first: "$companyName" },
          latestClose: { $first: "$close" },
          latestOpen: { $first: "$open" },
          latestHigh: { $first: "$high" },
          latestLow: { $first: "$low" },
          latestVolume: { $first: "$volume" },
          latestDate: { $first: "$date" },
        },
      },
    ]);

    // Loop through stocks and decide whether to update
    const updatedStockData = await Promise.all(
      latestStockData.map(async (stock) => {
        if (Math.random() < 0.2) {
          // 20% chance to update
          // console.log(`Updating stock data for ${stock._id}...`);
          const newStock = generateNewStockValues(stock);
          await StockCollection.create(newStock); // Save new stock data to DB
          return newStock;
        } else {
          // Return the existing latest stock data
          return {
            symbol: stock._id,
            companyName: stock.companyName,
            open: stock.latestOpen,
            close: stock.latestClose,
            high: stock.latestHigh,
            low: stock.latestLow,
            volume: stock.latestVolume,
            date: stock.latestDate,
          };
        }
      })
    );

    return updatedStockData;
  } catch (error) {
    console.error("Error fetching latest stock data:", error);
    return [];
  }
}

module.exports = { fetchLatestStockData };
